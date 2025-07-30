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
