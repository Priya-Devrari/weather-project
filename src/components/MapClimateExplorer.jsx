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
    <div>
      <h2>Weather & Climate Explorer</h2>
      <MapContainer center={[location.lat, location.lon]} zoom={5} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector onSelect={handleLocationSelect} />
        <Marker position={[location.lat, location.lon]}>
          <Popup>
            {loading ? (
              "Loading..."
            ) : weather ? (
              weather.error ? (
                weather.error
              ) : (
                <div>
                  <b>{weather.name || "Selected Location"}</b><br />
                  Temp: {weather.main.temp}°C<br />
                  {weather.weather && weather.weather[0] && (
                    <>Desc: {weather.weather[0].description}<br /></>
                  )}
                  Humidity: {weather.main.humidity}%<br />
                  Wind: {weather.wind.speed} km/h<br />
                  <hr />
                  <b>Seasonal Advice:</b>
                  <div>{getSeasonalAdvice(location.lat, location.lon, month)}</div>
                </div>
              )
            ) : (
              "Click anywhere on the map"
            )}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}