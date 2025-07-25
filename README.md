# Singapore Rain Checker

A real-time weather monitoring web application that provides intelligent rainfall detection and 15-minute vector-based forecasts for Singapore using official government APIs with sophisticated mathematical modeling.

![Singapore Rain Checker](https://img.shields.io/badge/Status-Active-green)
![React](https://img.shields.io/badge/React-19.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Vite](https://img.shields.io/badge/Vite-6.x-purple)

## Core Features

### Sequential Steps
1. Fetch rainfall data across all Singapore weather stations
2. Check if ANY station has ≥3mm rainfall
3. Only fetch wind speed and wind direction data if significant rain detected
4. Retrieve user's browser location
5. Calculate 15-minute rain prediction using wind velocity vectors

### Math Calculations
1. Geographic coordinates converted to Cartesian for local calculations
2. Determines if wind vectors point toward user location
3. Wind speed (knots) and direction converted to velocity vectors (km/h)
4. Calculates arrival time based on effective velocity components

### Data Management
- **5-minute Caching**: Weather data cached in localStorage to minimize API calls
- **Wind Vector Storage**: Normalized velocity vectors persisted for performance
- **Automatic Cleanup**: Expired cache data automatically removed

### 4. Intelligent UI
- **Progressive Display**: Wind data only shown when significant rain detected
- **Real-time Updates**: Shows current rainfall status and nearest weather station
- **Visual Indicators**: Different icons and colors for rain vs. no-rain states
- **Location Aware**: Displays user coordinates and nearest station information
- **Easter Egg**: Hidden mathematical analysis section for scientists and engineers (Ctrl+Shift+M)

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via inline classes)
- **APIs**: Data.gov.sg Real-time Weather Services
- **Storage**: Browser localStorage for caching
- **Geolocation**: Browser Geolocation API

## Mathematical Foundation

### Core Algorithms
1. **Haversine Formula**: Great-circle distance calculation for station proximity filtering
2. **Vector Analysis**: Wind velocity decomposition and projection for directional prediction
3. **Dot Product**: Determines if wind vectors point toward user location
4. **Cartesian Conversion**: Geographic coordinates transformed for efficient local calculations

### Key Formulas
- **Distance**: `d = R × 2 × atan2(√a, √(1−a))` where `a = sin²(Δφ/2) + cos φ₁ × cos φ₂ × sin²(Δλ/2)`
- **Wind Vector**: `v⃗ = (|v| × cos(θ+180°), |v| × sin(θ+180°))` 
- **ETA**: `time = (distance / effective_velocity) × 60` minutes

### Performance Optimizations
- **O(n log n)** computational complexity through sorted distance filtering
- **Lazy loading** of wind data only when significant rain detected
- **5-minute caching** with localStorage reduces API calls by ~80%
- **Proximity filtering** (15km radius) processes only relevant stations

> 🧮 **For Scientists & Engineers**: Press `Ctrl+Shift+M` in the app to view detailed mathematical analysis with formulas, implementation details, and performance metrics.

## API Integration

### Government APIs Used
- **Rainfall API**: `https://api-open.data.gov.sg/v2/real-time/api/rainfall`
- **Wind Speed API**: `https://api-open.data.gov.sg/v2/real-time/api/wind-speed`
- **Wind Direction API**: `https://api-open.data.gov.sg/v2/real-time/api/wind-direction`

### Data Flow
1. Check rainfall at all stations first
2. If no significant rain (< 3mm at ALL stations): Stop processing, inform user
3. If significant rain detected: Fetch wind data for vector calculations
4. Convert wind data to normalized velocity vectors
5. Store vectors in browser storage for persistence
6. Calculate if rain will reach user within 15 minutes

## 🧮 Mathematical Model

### Vector Normalization
```typescript
// Wind speed converted from knots to km/h
const speedKmh = speedKnots * 1.852;

// Wind direction is "from", so vector points opposite
const travelDirectionRad = ((directionDeg + 180) % 360) * (Math.PI / 180);

// Velocity components
const velocityX = speedKmh * Math.cos(travelDirectionRad);
const velocityY = speedKmh * Math.sin(travelDirectionRad);
```

### Prediction Algorithm
```typescript
// Dot product to check if wind points toward user
const dotProduct = windVector.velocityX * stationToUserX + windVector.velocityY * stationToUserY;

// Effective velocity component toward user
const effectiveVelocity = dotProduct / distanceToUser;

// Time calculation
const timeToReach = (distanceToUser / effectiveVelocity) * 60; // minutes
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with geolocation and localStorage support

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd rain-or-not

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Usage

1. **Open the application** in a web browser
2. **Grant location permission** when prompted
3. **View real-time rainfall status** for your area
4. **Check the 15-minute forecast** based on wind vector analysis
5. **Refresh manually** or wait for automatic updates

### Understanding the Display

- **Green/Sun Icon**: No significant rain detected
- **Blue/Rain Icon**: Rain ≥3mm detected at nearby stations
- **Wind Data**: Only shown when rain is detected
- **Forecast**: Predicts rain arrival within 15 minutes using vector calculations

## 🏗️ Technical Architecture

### Core Components
- **App.tsx**: Main application orchestration
- **weatherService.ts**: API integration with sequential logic
- **location.ts**: Vector calculations and geographic utilities
- **WeatherDisplay.tsx**: UI component with conditional wind data display

### Type System
- **WindVector**: Normalized velocity components (velocityX, velocityY, magnitude, direction)
- **WeatherData**: Extended with wind vectors and rain detection flag
- **Station**: Weather station with geographic coordinates

### Component Structure
```
src/
├── App.tsx              # Main application logic
├── components/          
│   ├── WeatherDisplay.tsx    # Main weather UI
│   ├── LoadingSpinner.tsx    # Loading states
│   ├── ErrorDisplay.tsx      # Error handling
│   └── icons.tsx            # SVG icon components
├── services/
│   └── weatherService.ts    # API integration
├── utils/
│   └── location.ts          # Vector calculations
├── types.ts             # TypeScript definitions
└── index.tsx           # Application entry point
```

## 📊 Performance & Production

### Optimizations
- Sequential API calls prevent unnecessary wind data fetching
- Efficient vector calculations using dot products
- Progressive loading with smooth UI transitions
- Error handling for location permission and API failures

### Data Accuracy
- Uses deterministic mathematical formulas
- Based on real-time government weather data
- 15-minute prediction window balances accuracy with usefulness

## 🧪 Development

### Code Quality
- Fully typed with TypeScript (interfaces, calculations, components, storage)
- ESLint configuration for code standards
- Modern React patterns with hooks
- Error boundaries for graceful failures

## 🚧 Future Enhancements
- Historical rain pattern analysis
- Multiple prediction time windows
- Integration with weather alerts
- Offline functionality with cached data
- Enhanced visualization with weather maps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Data.gov.sg** for providing real-time weather APIs
- **NEA Singapore** for meteorological data
- **React Team** for the excellent framework
- **Vite Team** for lightning-fast development experience

## 📧 Support

For questions or issues:
1. Check existing [GitHub Issues](../../issues)
2. Create a new issue with detailed description
3. Include browser console errors if applicable

---

**Built with ❤️ for Singapore's weather-conscious community** 