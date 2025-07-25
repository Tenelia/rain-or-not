import React from 'react';
import { Station, UserLocation } from '../types';
import { RainIcon, SunIcon, MapPinIcon, RadarIcon, ClockIcon, WindIcon, CompassIcon } from './icons';
import { convertDegreesToCardinal } from '../utils/location';

interface WeatherDisplayProps {
  isLoading: boolean;
  rainfallValue: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  nearestStation: Station | null;
  prediction: string | null;
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
  nearestStation,
  prediction,
  userLocation,
  timestamp,
  rainfallUnit,
  windSpeedUnit,
  significantRainDetected,
}) => {
  const isSignificantRain = rainfallValue !== null && rainfallValue >= 3;
  const lastUpdated = new Date(timestamp).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });

  const mainStatusClasses = isLoading ? 'opacity-50' : 'opacity-100';

  return (
    <div className={`space-y-6 transition-opacity duration-300 ${!isLoading && 'animate-fade-in'}`}>
      {/* Main Status Card */}
      <div className={`text-center p-6 bg-slate-800 rounded-lg shadow-lg transition-opacity duration-300 ${mainStatusClasses}`}>
        <div className="flex justify-center items-center text-sky-400 mb-4">
          {isSignificantRain ? <RainIcon className="w-16 h-16" /> : <SunIcon className="w-16 h-16" />}
        </div>
        <p className="text-4xl font-bold text-white">
          {isSignificantRain ? "Significant Rain" : "No Significant Rain"}
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
        {significantRainDetected && (
          <>
            <div className="bg-slate-800/70 p-4 rounded-lg flex items-center">
              <WindIcon className="w-6 h-6 mr-4 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-slate-400 text-sm">Wind Speed (at nearest station)</p>
                <p className="text-white font-medium">
                  {windSpeed !== null ? `${windSpeed.toFixed(1)} ${windSpeedUnit}` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="bg-slate-800/70 p-4 rounded-lg flex items-center">
              <CompassIcon className="w-6 h-6 mr-4 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-slate-400 text-sm">Wind Direction (at nearest station)</p>
                <p className="text-white font-medium">
                  {windDirection !== null ? `${convertDegreesToCardinal(windDirection)} (${windDirection}°)` : 'N/A'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Rain Forecast Card */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-4 mt-4 text-center">
         <div className="flex justify-center items-center text-sky-400 mb-3">
             <ClockIcon className="w-6 h-6 mr-2"/>
            <h3 className="text-lg font-semibold text-sky-300">Rain Forecast (15 min)</h3>
        </div>
        <p className="text-slate-300">
          {prediction || 'Calculating forecast...'}
        </p>
      </div>
    </div>
  );
};