
export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface Station {
  id: string;
  deviceId: string;
  name: string;
  labelLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface ReadingDataItem {
  stationId: string;
  value: number;
}

export interface Reading {
  timestamp: string;
  data: ReadingDataItem[];
}

export interface GenericApiResponse {
  code: number;
  errorMsg: string | null;
  data: {
    stations: Station[];
    readings: Reading[];
    readingType: string;
    readingUnit: string;
    paginationToken: string | null;
  };
}

export interface WindVector {
  velocityX: number;  // km/h component in X direction
  velocityY: number;  // km/h component in Y direction
  magnitude: number;  // Total speed in km/h
  directionDeg: number; // Direction of travel in degrees
}

export interface WeatherData {
  stations: Station[];
  rainfallMap: Record<string, number>;
  windSpeedMap: Record<string, number>;
  windDirectionMap: Record<string, number>;
  windVectors: Record<string, WindVector>;
  significantRainDetected: boolean;
  timestamp: string;
  rainfallUnit: string;
  windSpeedUnit: string;
  windDirectionUnit: string;
}

export interface CachedData {
  expiry: number;
  data: WeatherData;
}
