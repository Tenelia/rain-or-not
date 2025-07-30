import React from 'react';
import { Station, UserLocation } from '../types';
import { RainIcon, SunIcon, MapPinIcon, RadarIcon, WindIcon, CompassIcon } from './icons';
import { convertDegreesToCardinal } from '../utils/location';

interface WeatherDisplayProps {
  isLoading: boolean;
  rainfallValue: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windDataSource: string | null;
  nearestStation: Station | null;
  userLocation: UserLocation | null;
  timestamp: string;
  rainfallUnit: string;
  windSpeedUnit: string;
  significantRainDetected: boolean;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  isLoading,
  rainfallValue,
  windSpeed,
  windDirection,
  windDataSource,
  nearestStation,
  userLocation,
  timestamp,
  rainfallUnit,
  windSpeedUnit,
  significantRainDetected,
}) => {
  const isSignificantRain = rainfallValue !== null && rainfallValue >= 1; // Lowered from 3mm to 1mm
  const isHeavyRain = rainfallValue !== null && rainfallValue >= 3;
  const lastUpdated = new Date(timestamp).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });

  const mainStatusClasses = isLoading ? 'opacity-50' : 'opacity-100';

  // Determine rainfall status text and color
  const getRainfallStatus = () => {
    if (!rainfallValue || rainfallValue <= 0) return { text: "No Significant Rain", color: "text-white" };
    if (rainfallValue >= 3) return { text: "Heavy Rain", color: "text-red-400" };
    if (rainfallValue >= 2) return { text: "Moderate Rain", color: "text-yellow-400" };
    return { text: "Light Rain", color: "text-sky-400" };
  };

  const rainfallStatus = getRainfallStatus();

  return (
    <div className={`space-y-6 transition-opacity duration-300 ${!isLoading && 'animate-fade-in'}`}>
      {/* Main Status Card */}
      <div className={`text-center p-6 bg-slate-800 rounded-lg shadow-lg transition-opacity duration-300 ${mainStatusClasses}`}>
        <div className="flex justify-center items-center text-sky-400 mb-4">
          {isSignificantRain ? <RainIcon className="w-16 h-16" /> : <SunIcon className="w-16 h-16" />}
        </div>
        <p className={`text-2xl font-bold ${rainfallStatus.color}`}>
          {rainfallStatus.text}
        </p>
        <p className="text-slate-300 text-lg mt-2">
          {rainfallValue !== null ? `${rainfallValue.toFixed(2)} ${rainfallUnit}` : 'N/A'} at nearest station
        </p>
         <p className="text-slate-500 text-xs mt-2">Last updated: {lastUpdated}</p>
        {significantRainDetected && (
          <p className="text-amber-400 text-sm mt-2 font-medium">
            Wind data collected for vector analysis
          </p>
        )}
        {/* Add note about radar vs station data */}
        {!significantRainDetected && (
          <p className="text-slate-400 text-xs mt-3 leading-relaxed">
            Radar map may show rainfall that hasn't reached weather stations.
          </p>
        )}
      </div>

      {/* Details Section */}
      <div className={`space-y-4 transition-opacity duration-300 ${mainStatusClasses}`}>
        <div className="bg-slate-800/70 p-4 rounded-lg flex items-center">
          <MapPinIcon className="w-6 h-6 mr-4 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-slate-400 text-sm">Your Location</p>
            <p className="text-white font-medium">
              {userLocation 
                ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                : 'N/A'}
            </p>
          </div>
        </div>
        <div className="bg-slate-800/70 p-4 rounded-lg flex items-center">
          <RadarIcon className="w-6 h-6 mr-4 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-slate-400 text-sm">Nearest Weather Station</p>
            <p className="text-white font-medium">
              {nearestStation ? nearestStation.name : 'Finding...'}
            </p>
          </div>
        </div>
        {/* Only show wind data sections when significant rain is detected anywhere across Singapore */}
        {significantRainDetected && (
          <>
            <div className="bg-slate-800/70 p-4 rounded-lg flex items-center">
              <WindIcon className="w-6 h-6 mr-4 text-cyan-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-slate-400 text-sm">
                  Wind Speed
                  {windDataSource && windDataSource !== nearestStation?.name && (
                    <span className="text-amber-400 text-xs ml-1">(from nearby station)</span>
                  )}
                </p>
                <p className="text-white font-medium">
                  {windSpeed !== null ? `${windSpeed.toFixed(1)} ${windSpeedUnit}` : (
                    <span className="text-slate-500">Not available at nearby stations</span>
                  )}
                </p>
                {windDataSource && windDataSource !== nearestStation?.name && (
                  <p className="text-slate-500 text-xs mt-1">Source: {windDataSource}</p>
                )}
              </div>
            </div>
            <div className="bg-slate-800/70 p-4 rounded-lg flex items-center">
              <CompassIcon className="w-6 h-6 mr-4 text-orange-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-slate-400 text-sm">
                  Wind Direction
                  {windDataSource && windDataSource !== nearestStation?.name && (
                    <span className="text-amber-400 text-xs ml-1">(from nearby station)</span>
                  )}
                </p>
                <p className="text-white font-medium">
                  {windDirection !== null ? `${convertDegreesToCardinal(windDirection)} (${windDirection}°)` : (
                    <span className="text-slate-500">Not available at nearby stations</span>
                  )}
                </p>
                {windDataSource && windDataSource !== nearestStation?.name && (
                  <p className="text-slate-500 text-xs mt-1">Source: {windDataSource}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>


    </div>
  );
};