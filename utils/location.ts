import { UserLocation, WeatherData, WindVector } from '../types';

// Performance timing helper
const logTiming = (label: string, startTime: number) => {
  const duration = performance.now() - startTime;
  console.log(`⏱️ ${label}: ${duration.toFixed(1)}ms`);
  return duration;
};

/**
 * Calculates the great-circle distance between two points on the Earth.
 * @param loc1 - The first location with latitude and longitude.
 * @param loc2 - The second location with latitude and longitude.
 * @returns The distance in kilometers.
 */
export const getDistance = (loc1?: UserLocation, loc2?: UserLocation): number => {
  if (!loc1 || !loc2) {
    return Infinity;
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(loc2.latitude - loc1.latitude);
  const dLon = deg2rad(loc2.longitude - loc1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.latitude)) * Math.cos(deg2rad(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const rad2deg = (rad: number): number => {
  return rad * (180 / Math.PI);
};

/**
 * Converts wind direction from degrees to a cardinal direction string.
 * @param deg - The direction in degrees (0-360).
 * @returns A cardinal direction string (e.g., N, NE, S, SW).
 */
export const convertDegreesToCardinal = (deg: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((deg % 360) / 22.5)) % 16;
    return directions[index];
};

/**
 * Calculates the initial bearing from loc1 to loc2.
 * @param loc1 Start location
 * @param loc2 End location
 * @returns Bearing in degrees
 */
export const calculateBearing = (loc1: UserLocation, loc2: UserLocation): number => {
    const lat1 = deg2rad(loc1.latitude);
    const lon1 = deg2rad(loc1.longitude);
    const lat2 = deg2rad(loc2.latitude);
    const lon2 = deg2rad(loc2.longitude);

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const bearingRad = Math.atan2(y, x);

    return (rad2deg(bearingRad) + 360) % 360;
};

/**
 * Converts geographic coordinates to approximate Cartesian coordinates
 * for local vector calculations (assumes small distances in Singapore)
 */
const toCartesian = (location: UserLocation, reference: UserLocation) => {
    const R = 6371; // Earth radius in km
    const latDiff = deg2rad(location.latitude - reference.latitude);
    const lonDiff = deg2rad(location.longitude - reference.longitude);
    
    // Approximate Cartesian coordinates relative to reference point
    const x = R * lonDiff * Math.cos(deg2rad(reference.latitude));
    const y = R * latDiff;
    
    return { x, y };
};

/**
 * Calculates if rain will reach the user location within 15 minutes using vector analysis
 * @param userLocation The user's current location
 * @param weatherData The latest weather data containing rainfall and wind vectors
 * @returns A prediction message string
 */
export const calculateRainPrediction = (
  userLocation: UserLocation,
  weatherData: WeatherData,
): string => {
  const calculationStart = performance.now();
  const PREDICTION_TIME_MINUTES = 15;
  const SIGNIFICANT_RAIN_THRESHOLD_MM = 3;
  
  // Check if no significant rain is detected at ALL stations
  if (!weatherData.significantRainDetected) {
    const result = 'No significant rainfall (>=3mm) detected at any weather station. You should stay dry.';
    logTiming("Rain prediction calculation", calculationStart);
    return result;
  }

  // Find stations with significant rainfall and valid wind vectors
  const rainyStations = weatherData.stations.filter(
    (station) =>
      station.labelLocation &&
      (weatherData.rainfallMap[station.id] ?? 0) >= SIGNIFICANT_RAIN_THRESHOLD_MM &&
      weatherData.windVectors[station.id] &&
      weatherData.windVectors[station.id].magnitude > 0
  );

  if (rainyStations.length === 0) {
    const result = 'Significant rain detected elsewhere.';
    logTiming("Rain prediction calculation", calculationStart);
    return result;
  }

  const threats: Array<{
    stationName: string;
    timeToReach: number;
    distance: number;
  }> = [];

  // Convert user location to reference point for calculations
  const userCartesian = { x: 0, y: 0 }; // User is at origin

  for (const station of rainyStations) {
    const stationLoc = station.labelLocation!;
    const windVector = weatherData.windVectors[station.id];
    
    // Convert station location to Cartesian coordinates relative to user
    const stationCartesian = toCartesian(stationLoc, userLocation);
    
    // Calculate vector from station to user
    const stationToUserX = userCartesian.x - stationCartesian.x;
    const stationToUserY = userCartesian.y - stationCartesian.y;
    const distanceToUser = Math.sqrt(stationToUserX * stationToUserX + stationToUserY * stationToUserY);
    
    // Check if wind vector points towards user using dot product
    const dotProduct = windVector.velocityX * stationToUserX + windVector.velocityY * stationToUserY;
    
    // Only consider if wind is moving towards user (positive dot product)
    if (dotProduct > 0) {
      // Calculate effective velocity component towards user
      const effectiveVelocity = dotProduct / distanceToUser; // km/h
      
      if (effectiveVelocity > 0) {
        const timeToReach = (distanceToUser / effectiveVelocity) * 60; // Convert to minutes
        
        if (timeToReach <= PREDICTION_TIME_MINUTES) {
          threats.push({
            stationName: station.name,
            timeToReach: Math.round(timeToReach),
            distance: distanceToUser,
          });
        }
      }
    }
  }

  if (threats.length > 0) {
    // Sort by arrival time, then by distance for ties
    threats.sort((a, b) => a.timeToReach - b.timeToReach || a.distance - b.distance);
    const closestThreat = threats[0];
    
    if (closestThreat.timeToReach <= 5) {
      const result = `Rain from ${closestThreat.stationName} is very close and could arrive within ${closestThreat.timeToReach} minutes. Take cover soon!`;
      logTiming("Rain prediction calculation", calculationStart);
      return result;
    } else {
      const result = `Rain from ${closestThreat.stationName} is moving your way and could arrive in about ${closestThreat.timeToReach} minutes.`;
      logTiming("Rain prediction calculation", calculationStart);
      return result;
    }
  }
  
  const result = 'Significant rain is detected, but current wind patterns suggest it is not heading towards your location within the next 15 minutes.';
  logTiming("Rain prediction calculation", calculationStart);
  return result;
};