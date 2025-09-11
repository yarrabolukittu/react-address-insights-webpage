# Address Insights Webpage

A React web application that provides insights about any address including walkability scores, drivability scores, and urban/suburban classification.

![Status](https://img.shields.io/badge/Status-Live%20%E2%9C%85-brightgreen) ![Build](https://img.shields.io/badge/Build-Passing-brightgreen) ![Deployment](https://img.shields.io/badge/Deployed-Vercel-blue)

## 📸 Application Screenshot

![Address Insights Application](https://github.com/PaladinKnightMaster/react-address-insights-webpage/blob/main/Screenshot.png?raw=true)

*Example: Address analysis for Senior House at 13th Street (NYU) showing perfect walkability scores in NYC's Greenwich Village*

## 🌐 Live Demo

**Public URL:** [https://react-address-insights-webpage.vercel.app/](https://react-address-insights-webpage.vercel.app/)

**GitHub Repository:** [https://github.com/PaladinKnightMaster/react-address-insights-webpage](https://github.com/PaladinKnightMaster/react-address-insights-webpage)


## 🚀 Features

- **Address Search**: Enter any street address to get detailed insights
- **Walking Score**: Metric based on amenities within 500m walking distance
- **Driving Score**: Metric based on amenities within 2km driving distance  
- **Urban/Suburban Index**: Classification based on amenity density
- **Interactive Map**: Visual representation with nearby amenities highlighted
- **Search History**: Recent address lookups stored locally in browser
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ What I Built vs AI Generated

### Personally Built:
- Overall application architecture and component structure
- Scoring algorithm logic and mathematical calculations
- UI/UX design decisions and responsive layout
- Integration strategy between different APIs
- Error handling and user experience flows
- Search history functionality and localStorage management

### AI Assisted:
- CSS styling refinements and modern design patterns
- Some utility functions (distance calculations using Haversine formula)
- API integration boilerplate code
- React component optimization suggestions

## 🎯 Approach to Solving the Problem

### 1. **Technology Stack Selection**
- **React**: For component-based UI development
- **Leaflet + React-Leaflet**: For interactive maps
- **Axios**: For API requests
- **Nominatim API**: Free geocoding service (OpenStreetMap)
- **Overpass API**: For querying nearby amenities from OpenStreetMap

### 2. **Scoring Algorithm Design**
- **Walking Score (0-100)**: Based on essential amenities (restaurants, grocery stores, pharmacies, etc.) within 500m radius
  - Essential amenities: 10 points each
  - Leisure amenities: 5 points each
  - Capped at 100 points
  
- **Driving Score (0-100)**: Similar logic but 2km radius with lower point values
  - Essential amenities: 5 points each  
  - Leisure amenities: 3 points each
  
- **Urban Index**: Simple classification based on total amenity count
  - Urban: >50 amenities
  - Suburban: 20-50 amenities  
  - Rural: <20 amenities

### 3. **Data Sources & APIs**
- **Nominatim**: Free geocoding without API keys
- **Overpass API**: Rich amenity data from OpenStreetMap
- **OpenStreetMap tiles**: For map visualization

### 4. **User Experience Decisions**
- Single-page application with progressive disclosure
- Visual feedback with color-coded scores
- Interactive map with radius visualization
- Persistent search history using localStorage
- Mobile-first responsive design

## 🔧 Assumptions & Design Decisions

### Assumptions:
- Users primarily search for addresses in areas with reasonable OpenStreetMap coverage
- Walking distance considered as 500m (approximately 5-7 minute walk)
- Driving accessibility extends to 2km radius
- Local storage is acceptable for search history (no user accounts needed)

### Design Decisions:
- **Simple Heuristics**: Chose straightforward counting-based scoring over complex weighted algorithms for transparency
- **Free APIs**: Used only free, open-source APIs to avoid API key management issues
- **Progressive Enhancement**: Core functionality works even if map fails to load
- **Responsive Design**: Mobile-first approach since many users search addresses on mobile
- **Visual Hierarchy**: Clear separation between search, results, and map sections

## 🚀 Getting Started

### Try the Live App:
Visit [https://react-address-insights-webpage.vercel.app/](https://react-address-insights-webpage.vercel.app/) to use the application immediately!

### Local Development:
1. Clone the repository: `git clone https://github.com/PaladinKnightMaster/react-address-insights-webpage.git`
2. Install dependencies: `npm install` 
3. Start development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

*Note: This project uses npm (not pnpm) for consistency with Vercel deployment.*

## 📦 Deployment

✅ **Currently Deployed on Vercel:** [https://react-address-insights-webpage.vercel.app/](https://react-address-insights-webpage.vercel.app/)

This project is configured for Vercel deployment with:
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`
- **Node.js Version:** Latest LTS

### For Local Development:
```bash
git clone https://github.com/PaladinKnightMaster/react-address-insights-webpage.git
cd react-address-insights-webpage
npm install
npm start
```

### To Submit Project:
```bash
node submit.js
```
*Note: Pre-configured with Bryan Reyes' information*

## 🏗️ Project Structure

```
src/
├── App.js          # Main application component with all functionality
├── App.css         # Comprehensive styling with responsive design
├── index.js        # React app entry point
└── index.css       # Global styles
```

## 🎨 Technical Highlights

- **Real-time API Integration**: Combines geocoding and amenity data from multiple sources
- **Geospatial Calculations**: Haversine formula for accurate distance measurements
- **Interactive Mapping**: Custom markers and radius visualization
- **Performance Optimized**: Limits amenity markers to prevent map overcrowding
- **Error Resilient**: Graceful handling of API failures and invalid addresses