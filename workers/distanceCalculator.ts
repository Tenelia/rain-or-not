// Simple worker without threads library dependency
// Haversine formula for calculating distance between two geographic points
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

// Calculate distances for multiple stations
const calculateDistancesForStations = (
  userLat: number,
  userLon: number,
  stations: Array<{ id: string; lat: number; lon: number }>
): Array<{ id: string; distance: number }> => {
  return stations.map(station => ({
    id: station.id,
    distance: calculateDistance(userLat, userLon, station.lat, station.lon)
  }));
};

// Handle messages from main thread
self.onmessage = function(e) {
  const { type, data, id } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'calculateDistance':
        const { lat1, lon1, lat2, lon2 } = data;
        result = calculateDistance(lat1, lon1, lat2, lon2);
        break;
        
      case 'calculateDistancesForStations':
        const { userLat, userLon, stations } = data;
        result = calculateDistancesForStations(userLat, userLon, stations);
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    // Send result back to main thread
    self.postMessage({ type: 'success', id, result });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({ 
      type: 'error', 
      id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}; 