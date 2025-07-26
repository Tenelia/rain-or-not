
import { GenericApiResponse, WeatherData, Station, CachedData, WindVector } from '../types';

export interface WeatherConfig {
  radiusKm: number;
  maxStations: number;
  minStations: number;
}

const API_URLS = {
  rainfall: 'https://api-open.data.gov.sg/v2/real-time/api/rainfall',
  wind_speed: 'https://api-open.data.gov.sg/v2/real-time/api/wind-speed',
  wind_direction: 'https://api-open.data.gov.sg/v2/real-time/api/wind-direction',
};

// Get API key from environment variables
const getApiKey = (): string | null => {
  try {
    const apiKey = import.meta.env.VITE_DATA_GOV_API_KEY;
    return apiKey || null;
  } catch (error) {
    console.warn('Unable to access environment variables:', error);
    return null;
  }
};

// Headers for authenticated API requests
const getApiHeaders = (): HeadersInit => {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['x-api-key'] = apiKey;
    console.log('🔑 Using authenticated API requests');
  } else {
    console.warn('⚠️ No API key found. Using unauthenticated requests which may have rate limits.');
  }
  
  return headers;
};

const CACHE_KEY = 'weatherDataCache';
const WIND_VECTORS_KEY = 'windVectorsCache';

// Default configuration for geographic filtering
// Note: Singapore is ~50km wide, so 15km radius covers significant area while reducing processing
const DEFAULT_CONFIG: WeatherConfig = {
  radiusKm: 15,     // Only process stations within 15km radius
  maxStations: 20,  // Limit processing to 20 closest stations
  minStations: 5,   // Always keep at least 5 stations for reliability
};

// Performance timing helper
const logTiming = (label: string, startTime: number) => {
  const duration = performance.now() - startTime;
  console.log(`⏱️ ${label}: ${duration.toFixed(1)}ms`);
  return duration;
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Filter stations by proximity to user location
const filterNearbyStations = (
  stations: Station[], 
  userLat?: number, 
  userLon?: number,
  config: WeatherConfig = DEFAULT_CONFIG
): Station[] => {
  if (!userLat || !userLon) {
    console.log('⚠️ No user location provided, processing all stations');
    return stations;
  }

  const stationsWithDistance = stations
    .filter(station => station.labelLocation)
    .map(station => ({
      station,
      distance: calculateDistance(
        userLat, 
        userLon, 
        station.labelLocation!.latitude, 
        station.labelLocation!.longitude
      )
    }))
    .filter(item => item.distance <= config.radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, config.maxStations);

  let nearbyStations = stationsWithDistance.map(item => item.station);
  
  // Ensure we have at least a minimum number of stations for reliability
  if (nearbyStations.length < config.minStations && stations.length >= config.minStations) {
    const allStationsWithDistance = stations
      .filter(station => station.labelLocation)
      .map(station => ({
        station,
        distance: calculateDistance(
          userLat, 
          userLon, 
          station.labelLocation!.latitude, 
          station.labelLocation!.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, config.minStations);
    
    nearbyStations = allStationsWithDistance.map(item => item.station);
    console.log(`⚠️ Expanded to ${nearbyStations.length} closest stations (minimum required)`);
  }
  
  console.log(`📍 Filtered to ${nearbyStations.length} nearby stations (within ${config.radiusKm}km)`);
  console.log(`🎯 Processing ${Math.min(nearbyStations.length, config.maxStations)} closest stations`);
  
  return nearbyStations;
};

const getNext5MinMark = (): number => {
    const now = new Date();
    const minutes = now.getMinutes();
    const minutesToAdd = 5 - (minutes % 5);
    const expiry = new Date(now.getTime() + minutesToAdd * 60 * 1000);
    expiry.setSeconds(0);
    expiry.setMilliseconds(0);
    return expiry.getTime();
};

const getCachedData = (): WeatherData | null => {
    try {
        const cachedItem = localStorage.getItem(CACHE_KEY);
        if (!cachedItem) return null;

        const { expiry, data } = JSON.parse(cachedItem) as CachedData;
        
        if (Date.now() > expiry) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Failed to read cache", error);
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
};

const setCachedData = (data: WeatherData) => {
    try {
        const cacheItem: CachedData = {
            expiry: getNext5MinMark(),
            data,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheItem));
    } catch (error) {
        console.error("Failed to write to cache", error);
    }
};

/**
 * Converts wind speed (knots) and direction (degrees) to normalized velocity vectors
 * Direction is "from" so we add 180 degrees to get the travel direction
 */
const convertToWindVector = (speedKnots: number, directionDeg: number): WindVector => {
    // Convert speed from knots to km/h
    const speedKmh = speedKnots * 1.852;
    
    // Wind direction is "from", so vector points opposite direction
    const travelDirectionRad = ((directionDeg + 180) % 360) * (Math.PI / 180);
    
    // Calculate velocity components (normalized to km/h)
    const velocityX = speedKmh * Math.cos(travelDirectionRad);
    const velocityY = speedKmh * Math.sin(travelDirectionRad);
    
    return {
        velocityX,
        velocityY,
        magnitude: speedKmh,
        directionDeg: (directionDeg + 180) % 360
    };
};

const saveWindVectors = (windVectors: Record<string, WindVector>) => {
    try {
        const cacheItem = {
            expiry: getNext5MinMark(),
            data: windVectors,
        };
        localStorage.setItem(WIND_VECTORS_KEY, JSON.stringify(cacheItem));
    } catch (error) {
        console.error("Failed to save wind vectors to cache", error);
    }
};

export const fetchWeatherData = async (
  forceRefresh = false, 
  userLocation?: { latitude: number; longitude: number },
  config: WeatherConfig = DEFAULT_CONFIG
): Promise<WeatherData> => {
  const overallStart = performance.now();
  
  if (!forceRefresh) {
    const cacheStart = performance.now();
    const cachedData = getCachedData();
    if (cachedData) {
      logTiming("Cache retrieval", cacheStart);
      logTiming("Total (cached)", overallStart);
      return cachedData;
    }
    logTiming("Cache check (miss)", cacheStart);
  }

  try {
    // Step 1: Fetch rainfall data first
    const rainStart = performance.now();
    const rainResponse = await fetch(API_URLS.rainfall, { headers: getApiHeaders() }).then(res => res.json() as Promise<GenericApiResponse>);
    logTiming("Rainfall API", rainStart);
    
    if (rainResponse.code !== 0 || !rainResponse.data) {
        throw new Error(rainResponse.errorMsg || 'Rainfall API returned an error without a message.');
    }

    // Extract rainfall readings
    const processStart = performance.now();
    const rainfallMap: Record<string, number> = {};
    const latestRainReading = rainResponse.data.readings[0];
    if (latestRainReading && latestRainReading.data) {
        latestRainReading.data.forEach(item => {
            rainfallMap[item.stationId] = item.value;
        });
    }

    // Step 2: Check if ANY station has 1mm or more rainfall (lowered from 3mm to better match radar data)
    // Note: Light rainfall (1-2mm) is still meteorologically significant for wind pattern analysis
    const significantRainDetected = Object.values(rainfallMap).some(value => value >= 1);
    
    // Debug logging for rainfall detection
    const maxRainfall = Math.max(...Object.values(rainfallMap));
    const rainfallStationsAbove1mm = Object.values(rainfallMap).filter(value => value >= 1).length;
    const rainfallStationsAbove2mm = Object.values(rainfallMap).filter(value => value >= 2).length;
    const rainfallStationsAbove3mm = Object.values(rainfallMap).filter(value => value >= 3).length;
    
    console.log(`🌧️ Rainfall Analysis:`);
    console.log(`   Max rainfall detected: ${maxRainfall.toFixed(2)}mm`);
    console.log(`   Stations ≥1mm: ${rainfallStationsAbove1mm}/${Object.values(rainfallMap).length}`);
    console.log(`   Stations ≥2mm: ${rainfallStationsAbove2mm}/${Object.values(rainfallMap).length}`);
    console.log(`   Stations ≥3mm: ${rainfallStationsAbove3mm}/${Object.values(rainfallMap).length}`);
    console.log(`   Significant rain detected (≥1mm): ${significantRainDetected}`);
    console.log(`   Heavy rain detected (≥3mm): ${Object.values(rainfallMap).some(value => value >= 3)}`);
    
    logTiming("Rainfall data processing", processStart);
    
    let windSpeedMap: Record<string, number> = {};
    let windDirectionMap: Record<string, number> = {};
    let windSpeedResponse: GenericApiResponse | null = null;
    let windDirResponse: GenericApiResponse | null = null;
    let windVectors: Record<string, WindVector> = {};

    if (significantRainDetected) {
        // Step 3: Fetch wind data only if significant rain is detected
        const windStart = performance.now();
        [windSpeedResponse, windDirResponse] = await Promise.all([
            fetch(API_URLS.wind_speed, { headers: getApiHeaders() }).then(res => res.json() as Promise<GenericApiResponse>),
            fetch(API_URLS.wind_direction, { headers: getApiHeaders() }).then(res => res.json() as Promise<GenericApiResponse>),
        ]);
        logTiming("Wind APIs (parallel)", windStart);

        if (windSpeedResponse.code !== 0 || !windSpeedResponse.data) {
            throw new Error(windSpeedResponse.errorMsg || 'Wind speed API returned an error without a message.');
        }
        if (windDirResponse.code !== 0 || !windDirResponse.data) {
            throw new Error(windDirResponse.errorMsg || 'Wind direction API returned an error without a message.');
        }

        // Extract wind readings
        const latestWindSpeedReading = windSpeedResponse.data.readings[0];
        if (latestWindSpeedReading && latestWindSpeedReading.data) {
            latestWindSpeedReading.data.forEach(item => {
                windSpeedMap[item.stationId] = item.value;
            });
        }

        const latestWindDirReading = windDirResponse.data.readings[0];
        if (latestWindDirReading && latestWindDirReading.data) {
            latestWindDirReading.data.forEach(item => {
                windDirectionMap[item.stationId] = item.value;
            });
        }

        // Step 4: Convert wind data to normalized vectors and save to browser storage
        const vectorStart = performance.now();
        Object.keys(windSpeedMap).forEach(stationId => {
            const speed = windSpeedMap[stationId];
            const direction = windDirectionMap[stationId];
            if (speed !== undefined && direction !== undefined && speed > 0) {
                windVectors[stationId] = convertToWindVector(speed, direction);
            }
        });

        saveWindVectors(windVectors);
        logTiming("Vector calculations & storage", vectorStart);
    }
    
    // Combine station data from all responses
    const stationProcessingStart = performance.now();
    const stationMap = new Map<string, Station>();
    
    const responses = [rainResponse, windSpeedResponse, windDirResponse].filter(Boolean) as GenericApiResponse[];
    
    responses.forEach(res => {
        (res.data.stations as any[]).forEach(rawStation => {
            const locationData = rawStation.labelLocation || rawStation.location;
            const existingStation = stationMap.get(rawStation.id);

            if (existingStation) {
                if (!existingStation.labelLocation && locationData) {
                    existingStation.labelLocation = {
                        latitude: locationData.latitude,
                        longitude: locationData.longitude,
                    };
                }
            } else {
                const normalizedStation: Station = {
                    id: rawStation.id,
                    deviceId: rawStation.deviceId,
                    name: rawStation.name,
                    labelLocation: locationData ? {
                        latitude: locationData.latitude,
                        longitude: locationData.longitude,
                    } : undefined,
                };
                stationMap.set(rawStation.id, normalizedStation);
            }
        });
    });

    // Filter stations by proximity to user location for optimized processing
    const allStations = Array.from(stationMap.values());
    const nearbyStations = userLocation 
        ? filterNearbyStations(allStations, userLocation.latitude, userLocation.longitude, config)
        : allStations;
    
    logTiming("Station data processing & filtering", stationProcessingStart);

    // Filter data maps to only include nearby stations for better performance
    const nearbyStationIds = new Set(nearbyStations.map(station => station.id));
    const filteredRainfallMap: Record<string, number> = {};
    const filteredWindSpeedMap: Record<string, number> = {};
    const filteredWindDirectionMap: Record<string, number> = {};
    const filteredWindVectors: Record<string, WindVector> = {};

    // Only include data for nearby stations
    Object.keys(rainfallMap).forEach(stationId => {
        if (nearbyStationIds.has(stationId)) {
            filteredRainfallMap[stationId] = rainfallMap[stationId];
        }
    });

    Object.keys(windSpeedMap).forEach(stationId => {
        if (nearbyStationIds.has(stationId)) {
            filteredWindSpeedMap[stationId] = windSpeedMap[stationId];
        }
    });

    Object.keys(windDirectionMap).forEach(stationId => {
        if (nearbyStationIds.has(stationId)) {
            filteredWindDirectionMap[stationId] = windDirectionMap[stationId];
        }
    });

    Object.keys(windVectors).forEach(stationId => {
        if (nearbyStationIds.has(stationId)) {
            filteredWindVectors[stationId] = windVectors[stationId];
        }
    });

    const combinedData: WeatherData = {
        stations: nearbyStations,
        rainfallMap: userLocation ? filteredRainfallMap : rainfallMap,
        windSpeedMap: userLocation ? filteredWindSpeedMap : windSpeedMap,
        windDirectionMap: userLocation ? filteredWindDirectionMap : windDirectionMap,
        windVectors: userLocation ? filteredWindVectors : windVectors,
        significantRainDetected,
        timestamp: rainResponse.data.readings[0]?.timestamp || new Date().toISOString(),
        rainfallUnit: rainResponse.data.readingUnit,
        windSpeedUnit: windSpeedResponse?.data.readingUnit || 'knots',
        windDirectionUnit: windDirResponse?.data.readingUnit || 'degrees',
    };

    setCachedData(combinedData);
    logTiming("Total processing time", overallStart);
    return combinedData;

  } catch (error) {
    console.error("Error in fetchWeatherData:", error);
    logTiming("Failed after", overallStart);
    if (error instanceof Error) {
        throw new Error(`Could not retrieve weather data: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching weather data.");
  }
};

export const getWindVectorsFromStorage = (): Record<string, WindVector> | null => {
    try {
        const cachedItem = localStorage.getItem(WIND_VECTORS_KEY);
        if (!cachedItem) return null;

        const { expiry, data } = JSON.parse(cachedItem);
        
        if (Date.now() > expiry) {
            localStorage.removeItem(WIND_VECTORS_KEY);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Failed to read wind vectors from cache", error);
        localStorage.removeItem(WIND_VECTORS_KEY);
        return null;
    }
};
