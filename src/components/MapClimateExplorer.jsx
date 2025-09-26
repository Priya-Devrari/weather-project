'use client';

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { getCurrentWeatherByCoords } from '../services/weatherApi';
import "leaflet/dist/leaflet.css";

function getSeasonalAdvice(lat, lon, month) {
  if (lat > 20 && lat < 40) {
    if (month >= 5 && month <= 8) return "Rainy season (Monsoon). High risk of rain.";
    if (month >= 3 && month <= 5) return "Hot and dry. Heatwaves possible.";
    if (month >= 9 && month <= 11) return "Pleasant weather. Good for travel.";
    return "Mild winter. Occasional rain.";
  }
  if (lat >= 40) {
    if (month >= 11 || month <= 1) return "Cold winter. Snow possible.";
    if (month >= 5 && month <= 8) return "Warm summer. Occasional showers.";
    return "Spring/autumn: mild, some rain.";
  }
  if (lat < 20) {
    if (month >= 5 && month <= 10) return "Tropical rainy season. Be cautious of storms.";
    return "Dry season. Hot and sunny.";
  }
  return "Typical temperate weather.";
}

function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    }
  });
  return null;
}

export default function MapClimateExplorer() {
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090 }); // Default: Delhi
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const data = await getCurrentWeatherByCoords(lat, lon);
      setWeather(data);
    } catch (err) {
      setWeather({ error: err.message });
    }
    setLoading(false);
  };

  const handleLocationSelect = (latlng) => {
    setLocation({ lat: latlng.lat, lon: latlng.lng });
    fetchWeather(latlng.lat, latlng.lng);
  };

  const month = new Date().getMonth();

  return (
    <div className="mt-6">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-semibold">Weather &amp; Climate Explorer</h2>
          <span className="text-white/70 text-sm">Click on the map to get local weather</span>
        </div>
        <div className="h-[60vh]">
          <MapContainer center={[location.lat, location.lon]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationSelector onSelect={handleLocationSelect} />
            <Marker position={[location.lat, location.lon]}>
              <Popup>
                {loading ? (
                  <span className="text-sm">Loading...</span>
                ) : weather ? (
                  weather.error ? (
                    <span className="text-red-600 text-sm">{weather.error}</span>
                  ) : (
                    <div className="min-w-[200px]">
                      <div className="font-semibold mb-1">{weather.name || "Selected Location"}</div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <div><span className="font-medium">Temp:</span> {Math.round(weather.main.temp)}°C</div>
                        {weather.weather && weather.weather[0] && (
                          <div><span className="font-medium">Desc:</span> <span className="capitalize">{weather.weather[0].description}</span></div>
                        )}
                        <div><span className="font-medium">Humidity:</span> {weather.main.humidity}%</div>
                        <div><span className="font-medium">Wind:</span> {weather.wind.speed} km/h</div>
                      </div>
                      <hr className="my-2 border-gray-200" />
                      <div className="text-xs text-gray-600">
                        <div className="font-semibold mb-1">Seasonal Advice</div>
                        <div>{getSeasonalAdvice(location.lat, location.lon, month)}</div>
                      </div>
                    </div>
                  )
                ) : (
                  <span className="text-sm">Click anywhere on the map</span>
                )}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}