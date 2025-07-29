# Singapore Rain Checker

A real-time weather monitoring web application that provides intelligent rainfall detection and 15-minute vector-based forecasts for Singapore using official government APIs with sophisticated mathematical modeling.

![Singapore Rain Checker](https://img.shields.io/badge/Status-Active-green)
![React](https://img.shields.io/badge/React-19.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Vite](https://img.shields.io/badge/Vite-6.x-purple)

## Features

### Data Flow

1. Check rainfall at all stations first
2. If no significant rain (< 3mm at ALL stations): Stop processing, inform user
3. If significant rain detected: Fetch wind direction and wind speed data for vector calculations
4. Convert wind data to normalized velocity vectors
5. Store vectors in browser storage for persistence
6. Calculate if rain will reach user location within 15 minutes

### Math Calculations

1. Geographic coordinates converted to Cartesian for local calculations
2. Determines if wind vectors point toward user location
3. Wind speed (knots) and direction converted to velocity vectors (km/h)
4. Calculates arrival time based on effective velocity components

### Data Management

- **5-minute Caching**: Weather data cached in localStorage to minimize API calls
- **Wind Vector Storage**: Normalized velocity vectors persisted for performance
- **Automatic Cleanup**: Expired cache data automatically removed

### UI Logic

- **Progressive Display**: Wind data only shown when significant rain detected
- **Real-time Updates**: Shows current rainfall status and nearest weather station
- **Visual Indicators**: Different icons and colors for rain vs. no-rain states
- **Location Aware**: Displays user coordinates and nearest station information
- **Easter Egg**: Hidden mathematical analysis section for scientists and engineers (Ctrl+Shift+M)

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via inline classes)
- **APIs**: Data.gov.sg Real-time Weather Services
- **Storage**: Browser localStorage for caching
- **Geolocation**: Browser Geolocation API

## Maths

### Core Algorithms

1. **Haversine Formula**: Great-circle distance calculation for station proximity filtering
2. **Vector Analysis**: Wind velocity decomposition and projection for directional prediction
3. **Dot Product**: Determines if wind vectors point toward user location
4. **Cartesian Conversion**: Geographic coordinates transformed for efficient local calculations

### MAth Formulas

- **Distance**: `d = R × 2 × atan2(√a, √(1−a))` where `a = sin²(Δφ/2) + cos φ₁ × cos φ₂ × sin²(Δλ/2)`
- **Wind Vector**: `v⃗ = (|v| × cos(θ+180°), |v| × sin(θ+180°))`
- **ETA**: `time = (distance / effective_velocity) × 60` minutes

### Optimizations

- **O(n log n)** computational complexity through sorted distance filtering
- **Lazy loading** of wind data only when significant rain detected
- **5-minute caching** with localStorage reduces API calls by ~80%
- **Proximity filtering** (15km radius) processes only relevant stations

### Other Normalizations

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

> 🧮 Press `Ctrl+Shift+M` in webpage to view formulas, details, and metrics.

## APIs

- **Rainfall API**: `https://api-open.data.gov.sg/v2/real-time/api/rainfall`
- **Wind Speed API**: `https://api-open.data.gov.sg/v2/real-time/api/wind-speed`
- **Wind Direction API**: `https://api-open.data.gov.sg/v2/real-time/api/wind-direction`

## Security

This application enforces HTTPS-only connections for enhanced security:

- **Content Security Policy (CSP)**: Blocks mixed content and enforces HTTPS for all resources
- **Strict Transport Security (HSTS)**: Forces HTTPS connections with preload support
- **Security Headers**: Comprehensive security headers including anti-XSS protection
- **HTTPS Enforcement**: All external API calls use HTTPS, all SVG namespace references use HTTPS
- **Secure Development**: Vite configuration includes security headers for both development and production

The application includes utility functions (`utils/httpsUtils.ts`) for HTTPS enforcement and validation.

## Prerequisites

- Node.js 18+
- npm
- web browser with geolocation and localStorage support. This whole webpage gets saved locally so you don't keep hitting servers.
- Data.gov.sg API key (optional)

### Environment Variables

Create a `.env` file in the root directory with your variables:

```bash
# Take note of Vite's prefix requirement.
# Get your API key from: https://guide.data.gov.sg/developer-guide/api-overview/how-to-request-an-api-key
VITE_DATA_GOV_API_KEY=your_api_key_here
```

### Data.gov.sg says using an API key grants

- Improved API response times
- Higher rate limits
- More reliable access to weather data
- Priority processing for your requests

### Local Development

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Core Components

- **App.tsx**: Main application orchestration
- **weatherService.ts**: API integration with sequential logic
- **location.ts**: Vector calculations and geographic utilities
- **WeatherDisplay.tsx**: UI component with conditional wind data display

### Type System

- **WindVector**: Normalized velocity components (velocityX, velocityY, magnitude, direction)
- **WeatherData**: Extended with wind vectors and rain detection flag
- **Station**: Weather station with geographic coordinates

### Structure as of 2025-07-26

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

## 🚧 Future Enhancements

- Multiple prediction time windows
- Integration with weather alerts
- Offline functionality with cached data

## [MIT License](LICENSE)

## Acknowledgments

- **Data.gov.sg** for providing real-time weather APIs
- **NEA Singapore** for meteorological data
