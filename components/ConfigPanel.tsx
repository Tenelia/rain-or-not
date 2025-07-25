import React, { useState } from 'react';

export interface ConfigSettings {
  radiusKm: number;
  maxStations: number;
  minStations: number;
}

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigSettings;
  onConfigChange: (config: ConfigSettings) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [tempConfig, setTempConfig] = useState<ConfigSettings>(config);

  if (!isOpen) return null;

  const handleSave = () => {
    onConfigChange(tempConfig);
    onClose();
  };

  const handleReset = () => {
    const defaultConfig: ConfigSettings = {
      radiusKm: 15,
      maxStations: 20,
      minStations: 5,
    };
    setTempConfig(defaultConfig);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">⚙️ Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Search Radius */}
          <div>
            <label htmlFor="radius-slider" className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius: {tempConfig.radiusKm}km
            </label>
            <input
              id="radius-slider"
              type="range"
              min="5"
              max="50"
              step="5"
              value={tempConfig.radiusKm}
              onChange={(e) =>
                setTempConfig({ ...tempConfig, radiusKm: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Search radius in kilometers"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5km (nearby only)</span>
              <span>50km (whole Singapore)</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Only process weather stations within this radius from your location.
            </p>
          </div>

          {/* Max Stations */}
          <div>
            <label htmlFor="max-stations-slider" className="block text-sm font-medium text-gray-700 mb-2">
              Max Stations: {tempConfig.maxStations}
            </label>
            <input
              id="max-stations-slider"
              type="range"
              min="5"
              max="50"
              step="5"
              value={tempConfig.maxStations}
              onChange={(e) =>
                setTempConfig({ ...tempConfig, maxStations: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Maximum number of stations to process"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 (fastest)</span>
              <span>50 (most accurate)</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Maximum number of closest stations to process for calculations.
            </p>
          </div>

          {/* Min Stations */}
          <div>
            <label htmlFor="min-stations-slider" className="block text-sm font-medium text-gray-700 mb-2">
              Min Stations: {tempConfig.minStations}
            </label>
            <input
              id="min-stations-slider"
              type="range"
              min="3"
              max="15"
              step="1"
              value={tempConfig.minStations}
              onChange={(e) =>
                setTempConfig({ ...tempConfig, minStations: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Minimum number of stations for reliability"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 (basic)</span>
              <span>15 (reliable)</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Minimum stations to keep for reliable predictions.
            </p>
          </div>

          {/* Performance Impact */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📊 Performance Impact</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• Smaller radius = Faster processing</div>
              <div>• Fewer stations = Lower accuracy</div>
              <div>• Current settings process ~{Math.min(tempConfig.maxStations, Math.ceil(tempConfig.radiusKm / 2.5))} stations</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}; 