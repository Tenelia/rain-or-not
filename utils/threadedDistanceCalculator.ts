import { Station } from '../types'

// Simple worker interface without threads library
interface WorkerMessage {
  type: string;
  id: string;
  data?: any;
  result?: any;
  error?: string;
}

class ThreadedDistanceCalculator {
  private workers: Worker[] = []
  private isInitialized = false
  private cpuCores: number
  private messageId = 0
  private pendingRequests = new Map<string, { resolve: Function; reject: Function }>()

  constructor() {
    // Detect available CPU cores, fallback to 4 if not supported
    this.cpuCores = navigator.hardwareConcurrency || 4
    console.log(`🧵 Detected ${this.cpuCores} CPU cores for multi-threading`)
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Create optimized worker pool
      const poolSize = Math.min(this.cpuCores, 8) // Cap at 8 workers to avoid overhead
      
      for (let i = 0; i < poolSize; i++) {
        const worker = new Worker(new URL("../workers/distanceCalculator.ts", import.meta.url), { type: "module" })
        
        // Handle messages from worker
        worker.onmessage = (e) => {
          const { type, id, result, error } = e.data as WorkerMessage
          const request = this.pendingRequests.get(id)
          
          if (request) {
            this.pendingRequests.delete(id)
            
            if (type === 'success') {
              request.resolve(result)
            } else if (type === 'error') {
              request.reject(new Error(error || 'Worker error'))
            }
          }
        }
        
        // Handle worker errors
        worker.onerror = (error) => {
          console.error('Worker error:', error)
        }
        
        this.workers.push(worker)
      }

      this.isInitialized = true
      console.log(`✅ Thread pool initialized with ${poolSize} workers`)
    } catch (error) {
      console.warn("⚠️ Failed to initialize thread pool, falling back to synchronous calculation:", error)
      this.isInitialized = false
    }
  }

  private async sendToWorker(type: string, data: any): Promise<any> {
    if (!this.isInitialized || this.workers.length === 0) {
      throw new Error('Workers not initialized')
    }
    
    // Use round-robin to select worker
    const workerIndex = this.messageId % this.workers.length
    const worker = this.workers[workerIndex]
    const id = `msg_${this.messageId++}`
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      
      // Set timeout for worker response
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error('Worker timeout'))
        }
      }, 10000)
      
      worker.postMessage({ type, id, data })
    })
  }

  async calculateDistancesParallel(
    stations: Station[],
    userLat: number,
    userLon: number
  ): Promise<Array<{ station: Station; distance: number }>> {
    if (!this.isInitialized || this.workers.length === 0) {
      // Fallback to synchronous calculation
      return this.calculateDistancesSync(stations, userLat, userLon)
    }

    try {
      const startTime = performance.now()

      // Prepare station data for workers (only send necessary data)
      const stationData = stations
        .filter(station => station.labelLocation)
        .map(station => ({
          id: station.id,
          lat: station.labelLocation!.latitude,
          lon: station.labelLocation!.longitude
        }))

      if (stationData.length === 0) {
        return []
      }

      // For small datasets, use single worker to avoid overhead
      if (stationData.length <= 20) {
        const result = await this.sendToWorker('calculateDistancesForStations', {
          userLat,
          userLon,
          stations: stationData
        })
        
        const duration = performance.now() - startTime
        console.log(`🚀 Calculated ${stationData.length} distances in ${duration.toFixed(1)}ms (single worker)`)
        
        return this.mapResultsToStations(result, stations)
      }

      // For larger datasets, split work across multiple workers
      const chunkSize = Math.ceil(stationData.length / Math.min(this.workers.length, stationData.length))
      const chunks: Array<Array<{ id: string; lat: number; lon: number }>> = []
      
      for (let i = 0; i < stationData.length; i += chunkSize) {
        chunks.push(stationData.slice(i, i + chunkSize))
      }

      // Process chunks in parallel
      const promises = chunks.map(chunk =>
        this.sendToWorker('calculateDistancesForStations', {
          userLat,
          userLon,
          stations: chunk
        })
      )

      const results = await Promise.all(promises)
      const flatResults = results.flat()

      const duration = performance.now() - startTime
      console.log(`🚀 Calculated ${stationData.length} distances in ${duration.toFixed(1)}ms (${chunks.length} workers)`)

      return this.mapResultsToStations(flatResults, stations)
    } catch (error) {
      console.warn("⚠️ Thread pool calculation failed, falling back to synchronous:", error)
      return this.calculateDistancesSync(stations, userLat, userLon)
    }
  }

  private calculateDistancesSync(
    stations: Station[],
    userLat: number,
    userLon: number
  ): Array<{ station: Station; distance: number }> {
    console.log("🔄 Using synchronous distance calculation fallback")
    const startTime = performance.now()
    
    const results = stations
      .filter(station => station.labelLocation)
      .map(station => ({
        station,
        distance: this.calculateDistanceSync(
          userLat, 
          userLon, 
          station.labelLocation!.latitude, 
          station.labelLocation!.longitude
        )
      }))

    const duration = performance.now() - startTime
    console.log(`⏱️ Synchronous calculation: ${results.length} distances in ${duration.toFixed(1)}ms`)
    
    return results
  }

  private calculateDistanceSync(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private mapResultsToStations(
    results: Array<{ id: string; distance: number }>,
    stations: Station[]
  ): Array<{ station: Station; distance: number }> {
    const resultMap = new Map(results.map(r => [r.id, r.distance]))
    
    return stations
      .filter(station => resultMap.has(station.id))
      .map(station => ({
        station,
        distance: resultMap.get(station.id)!
      }))
  }

  async terminate(): Promise<void> {
    if (this.workers.length > 0) {
      this.workers.forEach(worker => worker.terminate())
      this.workers = []
      this.isInitialized = false
      this.pendingRequests.clear()
      console.log("🔚 Thread pool terminated")
    }
  }

  // Get optimal thread pool size based on CPU cores and workload
  static getOptimalPoolSize(dataSize: number): number {
    const cores = navigator.hardwareConcurrency || 4
    
    // For small datasets, single thread is often faster due to overhead
    if (dataSize <= 10) return 1
    
    // For medium datasets, use moderate parallelization
    if (dataSize <= 50) return Math.min(cores / 2, 4)
    
    // For large datasets, use most available cores but cap to avoid diminishing returns
    return Math.min(cores, 8)
  }
}

// Export singleton instance for reuse across the application
export const distanceCalculator = new ThreadedDistanceCalculator() 