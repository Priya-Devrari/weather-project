import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { getCurrentWeatherByCoords } from '../services/weatherApi';
import 'leaflet/dist/leaflet.css';

function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    }
  });
  return null;
}

function MapWeatherExplorer() {
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090 });
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = async (latlng) => {
    setLocation({ lat: latlng.lat, lon: latlng.lng });
    setLoading(true);
    try {
      const data = await getCurrentWeatherByCoords(latlng.lat, latlng.lng);
      setWeather(data);
    } catch (err) {
      setWeather({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <MapContainer center={[location.lat, location.lon]} zoom={5} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector onSelect={handleLocationSelect} />
        <Marker position={[location.lat, location.lon]}>
          <Popup>
            {loading ? "Loading..." :
              weather ? (
                weather.error ? weather.error :
                <div>
                  <b>{weather.name || "Selected Location"}</b><br />
                  Temp: {weather.main.temp}°C<br />
                  Desc: {weather.weather[0].description}<br />
                  Humidity: {weather.main.humidity}%<br />
                  Wind: {weather.wind.speed} km/h
                </div>
              ) : "Click anywhere on the map"}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
export default MapWeatherExplorer;