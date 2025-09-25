'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ScaleControl, ZoomControl, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getWeatherIconUrl } from '../services/weatherApi';
import { formatWindSpeed } from '../utils/weatherUtils';

// Fix default icon URLs in Leaflet when bundling
// (we'll use DivIcons for temps, but keep defaults for fallback)
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import icon1x from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon1x.src || icon1x,
  iconRetinaUrl: icon2x.src || icon2x,
  shadowUrl: shadow.src || shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

// Create a colored temperature badge icon as a Leaflet DivIcon
const tempBadgeIcon = (tempC) => {
  const t = Math.round(tempC);
  // hue from blue (cold) to red (hot)
  const hue = t <= 0 ? 210 : t <= 10 ? 200 : t <= 20 ? 180 : t <= 30 ? 40 : 10;
  const bg = `hsl(${hue} 90% 55%)`;
  const shadow = 'rgba(0,0,0,0.25)';
  const html = `
    <div style="
      display:inline-flex;align-items:center;justify-content:center;
      width:36px;height:36px;border-radius:9999px;
      background:${bg};color:#fff;font-weight:700;font-size:14px;
      box-shadow:0 6px 14px ${shadow};
      border:2px solid rgba(255,255,255,.7);
    ">${t}°</div>
  `;
  return L.divIcon({ html, className: 'temp-badge', iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18] });
};

// Compute a grid of sample points based on bounds and zoom, with throttling of point count
const makeGridPoints = (bounds, zoom) => {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  // grid density varies with zoom
  // smaller step at higher zooms
  const step = zoom >= 12 ? 0.05 : zoom >= 10 ? 0.1 : zoom >= 8 ? 0.2 : 0.4; // degrees
  const points = [];
  for (let lat = sw.lat; lat <= ne.lat; lat += step) {
    for (let lon = sw.lng; lon <= ne.lng; lon += step) {
      points.push([Number(lat.toFixed(4)), Number(lon.toFixed(4))]);
    }
  }
  // cap to 60 points to avoid rate limits; sample evenly if needed
  const cap = 60;
  if (points.length > cap) {
    const stride = Math.ceil(points.length / cap);
    return points.filter((_, i) => i % stride === 0);
  }
  return points;
};

function MapEvents({ onChange }) {
  useMapEvents({
    moveend: (e) => onChange(e.target.getBounds(), e.target.getZoom()),
    zoomend: (e) => onChange(e.target.getBounds(), e.target.getZoom()),
  });
  return null;
}

export default function WeatherMap() {
  const mapRef = useRef(null);
  const [center, setCenter] = useState([28.6139, 77.2090]); // New Delhi default
  const [zoom, setZoom] = useState(7);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter([latitude, longitude]);
        setZoom(9);
      });
    }
  }, []);

  const fetchPoints = useCallback(async (bounds, zoomLevel) => {
    if (!API_KEY) {
      setError('Missing OpenWeather API key');
      return;
    }
    setLoading(true);
    setError(null);
    const pts = makeGridPoints(bounds, zoomLevel);

    // Fetch current weather for each point
    const requests = pts.map(([lat, lon]) =>
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
        .then((data) => ({ lat, lon, data }))
        .catch(() => null)
    );

    const results = await Promise.allSettled(requests);
    const items = results
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter(Boolean)
      .map(({ lat, lon, data }) => ({
        id: `${lat},${lon}`,
        lat,
        lon,
        temp: data.main?.temp ?? null,
        humidity: data.main?.humidity ?? null,
        wind: data.wind?.speed ?? null,
        condition: data.weather?.[0]?.main ?? 'N/A',
        description: data.weather?.[0]?.description ?? '',
        icon: data.weather?.[0]?.icon ?? null,
        name: data.name ?? '',
      }));

    setMarkers(items);
    setLoading(false);
  }, []);

  const onViewChange = useCallback((b, z) => {
    fetchPoints(b, z);
  }, [fetchPoints]);

  const initialBoundsHandler = useCallback((map) => {
    const b = map.getBounds();
    const z = map.getZoom();
    fetchPoints(b, z);
  }, [fetchPoints]);

  const whenCreated = (map) => {
    mapRef.current = map;
    setTimeout(() => initialBoundsHandler(map), 50);
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur">
      <div className="flex items-center justify-between p-3 text-white/90">
        <div className="font-semibold">Global Weather Map</div>
        {loading && <div className="text-xs">Loading map data…</div>}
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: '70vh', width: '100%' }}
        whenCreated={whenCreated}
      >
        <ZoomControl position="topright" />
        <ScaleControl position="bottomleft" />
        <MapEvents onChange={onViewChange} />

        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Stamen Toner">
            <TileLayer url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          {/* Optional: OpenWeather temperature overlay tiles */}
          <LayersControl.Overlay name="Temperature overlay">
            <TileLayer url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`} opacity={0.45} />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Clouds overlay">
            <TileLayer url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`} opacity={0.5} />
          </LayersControl.Overlay>
        </LayersControl>

        {markers.map(m => (
          <Marker key={m.id} position={[m.lat, m.lon]} icon={m.temp != null ? tempBadgeIcon(m.temp) : DefaultIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-medium mb-1">{m.name || `${m.lat.toFixed(2)}, ${m.lon.toFixed(2)}`}</div>
                <div className="flex items-center gap-2 mb-2">
                  {m.icon && (
                    <img src={getWeatherIconUrl(m.icon)} alt={m.description} className="w-8 h-8" />
                  )}
                  <div className="text-lg font-semibold">{Math.round(m.temp)}°C</div>
                </div>
                <div className="text-sm text-gray-700">
                  <div><span className="font-medium">Condition:</span> <span className="capitalize">{m.description || m.condition}</span></div>
                  {m.humidity != null && <div><span className="font-medium">Humidity:</span> {m.humidity}%</div>}
                  {m.wind != null && <div><span className="font-medium">Wind:</span> {formatWindSpeed(m.wind)}</div>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {error && (
        <div className="p-3 text-sm text-red-100 bg-red-500/20 border-t border-red-400/30">{error}</div>
      )}
      <div className="p-3 text-xs text-white/70">
        Tip: pan/zoom the map to refresh data; overlays available in the layer control (top-left).
      </div>
    </div>
  );
}
