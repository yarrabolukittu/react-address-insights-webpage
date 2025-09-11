import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('addressSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('addressSearchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const searchAddress = async (searchAddress = address) => {
    if (!searchAddress.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use Nominatim (OpenStreetMap) for geocoding (free, no API key required)
      const geocodeResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AddressInsights/1.0 (https://github.com/paladinknightmaster/address-insights-webpage)'
          }
        }
      );

      if (geocodeResponse.data.length === 0) {
        setError('Address not found');
        setLoading(false);
        return;
      }

      const location = geocodeResponse.data[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);

      // Search for nearby amenities using Overpass API
      const amenitiesQuery = `
        [out:json][timeout:25];
        (
          node["amenity"](around:1000,${lat},${lon});
          node["shop"](around:1000,${lat},${lon});
          node["leisure"](around:1000,${lat},${lon});
          node["tourism"](around:1000,${lat},${lon});
        );
        out geom;
      `;

      const overpassResponse = await axios.get(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(amenitiesQuery)}`,
        {
          headers: {
            'User-Agent': 'AddressInsights/1.0 (https://github.com/paladinknightmaster/address-insights-webpage)'
          }
        }
      );

      const amenities = overpassResponse.data.elements || [];
      
      // Calculate scores
      const scores = calculateScores(amenities, lat, lon);
      
      const resultData = {
        address: location.display_name,
        coordinates: { lat, lon },
        amenities,
        scores,
        timestamp: new Date().toISOString()
      };

      setResults(resultData);
      
      // Add to search history (keep only last 10)
      const newHistory = [
        { address: location.display_name, timestamp: new Date().toISOString() },
        ...searchHistory.filter(item => item.address !== location.display_name)
      ].slice(0, 10);
      
      setSearchHistory(newHistory);
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch data. Please try again.');
    }
    
    setLoading(false);
  };

  const calculateScores = (amenities, lat, lon) => {
    // Categorize amenities
    const walkingRadius = 500; // meters
    const drivingRadius = 2000; // meters
    
    const walkingAmenities = amenities.filter(amenity => 
      getDistance(lat, lon, amenity.lat, amenity.lon) <= walkingRadius
    );
    
    const drivingAmenities = amenities.filter(amenity => 
      getDistance(lat, lon, amenity.lat, amenity.lon) <= drivingRadius
    );

    // Count different types of amenities
    const essentialTypes = ['restaurant', 'cafe', 'grocery', 'supermarket', 'pharmacy', 'hospital', 'school', 'bank'];
    const leisureTypes = ['park', 'gym', 'cinema', 'bar', 'pub'];
    
    const walkingEssentials = walkingAmenities.filter(a => 
      essentialTypes.includes(a.tags?.amenity) || essentialTypes.includes(a.tags?.shop)
    ).length;
    
    const walkingLeisure = walkingAmenities.filter(a => 
      leisureTypes.includes(a.tags?.amenity) || leisureTypes.includes(a.tags?.leisure)
    ).length;
    
    const drivingEssentials = drivingAmenities.filter(a => 
      essentialTypes.includes(a.tags?.amenity) || essentialTypes.includes(a.tags?.shop)
    ).length;
    
    const drivingLeisure = drivingAmenities.filter(a => 
      leisureTypes.includes(a.tags?.amenity) || leisureTypes.includes(a.tags?.leisure)
    ).length;

    // Calculate scores (0-100)
    const walkingScore = Math.min(100, (walkingEssentials * 10) + (walkingLeisure * 5));
    const drivingScore = Math.min(100, (drivingEssentials * 5) + (drivingLeisure * 3));
    
    // Urban/Suburban index based on amenity density
    const totalDensity = amenities.length;
    let urbanIndex;
    if (totalDensity > 50) urbanIndex = 'Urban';
    else if (totalDensity > 20) urbanIndex = 'Suburban';
    else urbanIndex = 'Rural';

    return {
      walkingScore,
      drivingScore,
      urbanIndex,
      walkingAmenities: walkingAmenities.length,
      drivingAmenities: drivingAmenities.length,
      totalAmenities: amenities.length
    };
  };

  // Calculate distance between two points using Haversine formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FF5722';
    return '#F44336';
  };

  const handleHistoryClick = (historicalAddress) => {
    setAddress(historicalAddress);
    searchAddress(historicalAddress);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏠 Address Insights</h1>
        <p>Discover walkability, drivability, and urban characteristics of any address</p>
      </header>

      <main className="App-main">
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter a street address (e.g., 123 Main St, New York, NY)"
              className="address-input"
              onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
            />
            <button 
              onClick={() => searchAddress()} 
              disabled={loading}
              className="search-button"
            >
              {loading ? 'Searching...' : 'Get Insights'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>

        {searchHistory.length > 0 && (
          <div className="search-history">
            <h3>Recent Searches</h3>
            <div className="history-list">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item.address)}
                  className="history-item"
                >
                  {item.address.split(',')[0]}...
                </button>
              ))}
            </div>
          </div>
        )}

        {results && (
          <div className="results-section">
            <div className="address-header">
              <h2>📍 {results.address}</h2>
            </div>

            <div className="scores-grid">
              <div className="score-card">
                <h3>🚶 Walking Score</h3>
                <div 
                  className="score-value"
                  style={{ color: getScoreColor(results.scores.walkingScore) }}
                >
                  {results.scores.walkingScore}/100
                </div>
                <p>{results.scores.walkingAmenities} amenities within 500m</p>
              </div>

              <div className="score-card">
                <h3>🚗 Driving Score</h3>
                <div 
                  className="score-value"
                  style={{ color: getScoreColor(results.scores.drivingScore) }}
                >
                  {results.scores.drivingScore}/100
                </div>
                <p>{results.scores.drivingAmenities} amenities within 2km</p>
              </div>

              <div className="score-card">
                <h3>🏙️ Area Type</h3>
                <div className="score-value area-type">
                  {results.scores.urbanIndex}
                </div>
                <p>{results.scores.totalAmenities} total amenities found</p>
              </div>
            </div>

            <div className="map-section">
              <h3>📍 Location & Nearby Amenities</h3>
              <MapContainer
                center={[results.coordinates.lat, results.coordinates.lon]}
                zoom={15}
                style={{ height: '400px', width: '100%' }}
                className="map-container"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Main address marker */}
                <Marker position={[results.coordinates.lat, results.coordinates.lon]}>
                  <Popup>
                    <strong>📍 Your Address</strong><br />
                    {results.address}
                  </Popup>
                </Marker>

                {/* Walking radius circle */}
                <Circle
                  center={[results.coordinates.lat, results.coordinates.lon]}
                  radius={500}
                  pathOptions={{ color: 'green', fillOpacity: 0.1 }}
                />

                {/* Driving radius circle */}
                <Circle
                  center={[results.coordinates.lat, results.coordinates.lon]}
                  radius={2000}
                  pathOptions={{ color: 'blue', fillOpacity: 0.05 }}
                />

                {/* Amenity markers */}
                {results.amenities.slice(0, 50).map((amenity, index) => (
                  amenity.lat && amenity.lon && (
                    <Marker key={index} position={[amenity.lat, amenity.lon]}>
                      <Popup>
                        <strong>{amenity.tags?.name || 'Amenity'}</strong><br />
                        Type: {amenity.tags?.amenity || amenity.tags?.shop || amenity.tags?.leisure || 'Unknown'}<br />
                        Distance: {Math.round(getDistance(results.coordinates.lat, results.coordinates.lon, amenity.lat, amenity.lon))}m
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
              <div className="map-legend">
                <span className="legend-item">🔵 2km driving radius</span>
                <span className="legend-item">🟢 500m walking radius</span>
                <span className="legend-item">📍 Address & amenities</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
