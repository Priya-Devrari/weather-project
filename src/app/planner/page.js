'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Calendar, Settings, Navigation, Activity, TrendingUp, Zap, Share2, Thermometer, Droplets, Wind, Gauge, Wifi, WifiOff } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  LineChart, Line, BarChart, Bar
} from 'recharts';

// Use a dedicated client-only Leaflet map wrapper component
const PlannerLeafletMap = dynamic(() => import('../../components/PlannerLeafletMap'), { ssr: false });

// --------- Utility: Date Formatting -----------
function formatDate(date, formatStr) {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (formatStr === 'yyyy-MM-dd') {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  if (formatStr === 'MMM dd, yyyy') {
    return months[d.getMonth()] + ' ' + String(d.getDate()).padStart(2, '0') + ', ' + d.getFullYear();
  }
  if (formatStr === 'ddd') {
    return days[d.getDay()];
  }
  return d.toLocaleDateString();
}

// Helper to build a mock forecast (used when key is missing or request fails)
function buildMockForecast(lat, lon) {
  const now = Date.now();
  const hourly = Array.from({ length: 24 }).map((_, i) => ({
    time: new Date(now + i * 3600_000).toISOString(),
    pop: Math.random(),
    precip_mm: Math.round(Math.random() * 10) / 2,
    windSpeed: Math.round(Math.random() * 20),
    humidity: Math.round(Math.random() * 100),
    temp: Math.round(Math.random() * 12 + 18),
    pressure: 1000 + Math.round(Math.random() * 20),
    visibility: Math.round(Math.random() * 10),
    uvIndex: Math.round(Math.random() * 10),
  }));
  const weeklyData = Array.from({ length: 7 }).map((_, i) => ({
    date: formatDate(new Date(now + i * 86400_000), 'ddd'),
    risk: Math.round(Math.random() * 100),
    temp: Math.round(Math.random() * 12 + 18),
    humidity: Math.round(Math.random() * 100),
  }));
  const overallRisk = Math.round(100 * (hourly.reduce((s, x) => s + x.pop, 0) / (hourly.length || 1)));
  return {
    meta: { source: 'Mock', lat, lon, date: new Date().toISOString(), lastUpdated: new Date().toISOString() },
    overallRisk,
    hourly,
    weeklyData,
    alerts: generateWeatherAlerts(overallRisk),
    airQuality: { aqi: Math.round(Math.random() * 200 + 50), category: ['Good', 'Moderate', 'Unhealthy'][Math.floor(Math.random() * 3)] },
  };
}

// --------- Real Weather API Integration (OpenWeatherMap) -----------
async function fetchWeatherAPI({ lat, lon }) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return buildMockForecast(lat, lon);
  }

  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,current,alerts&units=metric&appid=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return buildMockForecast(lat, lon);
    }
    const data = await res.json();

  const hourly = (data.hourly || []).map((h) => {
    const t = new Date(h.dt * 1000);
    return {
      time: t.toISOString(),
      pop: h.pop ?? 0,
      precip_mm: h.rain?.['1h'] ?? 0,
      windSpeed: Math.round(h.wind_speed ?? 0),
      humidity: h.humidity,
      temp: Math.round(h.temp),
      pressure: h.pressure,
      visibility: Math.round((h.visibility ?? 0) / 1000),
      uvIndex: h.uvi,
    };
  });

  const weeklyData = (data.daily || []).slice(0, 7).map((d) => {
    const day = new Date(d.dt * 1000);
    return {
      date: formatDate(day, 'ddd'),
      risk: Math.round((d.pop ?? 0) * 100),
      temp: Math.round(d.temp?.day ?? 0),
      humidity: d.humidity,
    };
  });

    const overallRisk = Math.round(100 * (hourly.reduce((s, x) => s + x.pop, 0) / (hourly.length || 1)));
    return {
      meta: { source: 'OpenWeatherMap', lat, lon, date: new Date().toISOString(), lastUpdated: new Date().toISOString() },
      overallRisk,
      hourly,
      weeklyData,
      alerts: generateWeatherAlerts(overallRisk),
      airQuality: { aqi: Math.round(Math.random() * 200 + 50), category: ['Good', 'Moderate', 'Unhealthy'][Math.floor(Math.random() * 3)] },
    };
  } catch {
    return buildMockForecast(lat, lon);
  }
}

function generateWeatherAlerts(risk) {
  const alerts = [];
  if (risk > 70) alerts.push({ type: 'warning', message: 'Heavy rain expected. Consider indoor alternatives.', icon: '⚠' });
  if (risk > 40) alerts.push({ type: 'advisory', message: 'Moderate rain possible. Have backup plans ready.', icon: '🌦' });
  return alerts;
}

function computeWindowRisk(hourly, startHour, endHour) {
  const selected = hourly.filter((h) => {
    const d = new Date(h.time);
    const hr = d.getHours();
    if (startHour <= endHour) return hr >= startHour && hr < endHour;
    return hr >= startHour || hr < endHour;
  });
  if (selected.length === 0) return { riskPct: 0, avgPOP: 0 };
  const avgPOP = selected.reduce((s, x) => s + x.pop, 0) / selected.length;
  const maxPrecip = Math.max(...selected.map((h) => h.precip_mm));
  const avgWind = selected.reduce((s, x) => s + (x.windSpeed || 0), 0) / selected.length;
  const avgTemp = selected.reduce((s, x) => s + (x.temp || 0), 0) / selected.length;
  const avgHumidity = selected.reduce((s, x) => s + (x.humidity || 0), 0) / selected.length;
  return {
    riskPct: Math.round(avgPOP * 100),
    avgPOP,
    selected,
    maxPrecip: Math.round(maxPrecip * 10) / 10,
    avgWind: Math.round(avgWind),
    avgTemp: Math.round(avgTemp),
    avgHumidity: Math.round(avgHumidity),
  };
}

// --------- Responsive Button -----------
function ResponsiveButton({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-5 text-xl',
  };
  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading} {...props}>
      {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />}
      {children}
    </button>
  );
}

function WeatherEmoji({ pop, temp }) {
  if (temp && temp < 5) return '❄';
  if (pop >= 0.8) return '⛈';
  if (pop >= 0.6) return '🌧';
  if (pop >= 0.4) return '⛅';
  if (pop >= 0.2) return '🌤';
  return '☀';
}

function MapCard({ lat, lon, location }) {
  // Ensure we only render on the client after hydration completes
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg my-4">
      <PlannerLeafletMap key={`${lat},${lon}`} lat={lat} lon={lon} location={location} />
    </div>
  );
}

function AnalyticsDashboard({ forecast }) {
  if (!forecast) return null;
  const chartData = forecast.hourly.slice(0, 12).map((h) => ({
    time: new Date(h.time).getHours(),
    risk: Math.round(h.pop * 100),
    temp: h.temp,
    humidity: h.humidity,
    wind: h.windSpeed,
  }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" size={20} />
          Rain Risk Trend
        </h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tickFormatter={(h) => `${h}:00`} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip labelFormatter={(h) => `${h}:00`} formatter={(value) => [`${value}%`, 'Rain Risk']} />
              <Area type="monotone" dataKey="risk" stroke="#6366f1" fill="url(#gradient)" strokeWidth={2} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="text-green-600" size={20} />
          Weather Metrics
        </h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tickFormatter={(h) => `${h}:00`} />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} name="Temperature (°C)" />
              <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {forecast.weeklyData && (
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-purple-600" size={20} />
            7-Day Outlook
          </h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="risk" fill="#8b5cf6" name="Rain Risk %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function HourlyChart({ hourly, eventStart, eventEnd }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-lg font-semibold text-gray-800">24-Hour Forecast</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-amber-300 rounded-full" />
          <span>Event Time</span>
        </div>
      </div>
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
        {hourly.slice(0, 12).map((h, i) => {
          const date = new Date(h.time);
          const hour = date.getHours();
          const isEventTime = hour >= eventStart && hour < eventEnd;
          return (
            <div
              key={i}
              className={`min-w-[70px] md:min-w-[80px] text-center p-3 md:p-4 rounded-xl transition-all hover:scale-105 ${
                isEventTime
                  ? 'bg-gradient-to-b from-amber-100 to-amber-50 border-2 border-amber-300 shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="text-xs text-gray-600 mb-2 font-medium">
                {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
              </div>
              <div className="text-2xl md:text-3xl mb-2">{WeatherEmoji({ pop: h.pop, temp: h.temp })}</div>
              <div className="text-sm font-semibold text-gray-800 mb-1">{Math.round(h.pop * 100)}%</div>
              <div className="text-xs text-gray-500 mb-1">{h.precip_mm}mm</div>
              <div className="text-xs text-gray-500">{h.temp}°C</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConnectionStatus({ online }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
        online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {online ? <Wifi size={12} /> : <WifiOff size={12} />}
      {online ? 'Connected' : 'Offline'}
    </div>
  );
}

function WeatherDetailsCard({ forecast, eventWindow }) {
  if (!forecast) return null;
  const { aqi, category } = forecast.airQuality;
  const { avgWind, avgTemp, avgHumidity, maxPrecip } = eventWindow?.windowInfo || {};
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg mt-4 grid grid-cols-2 gap-4 text-center">
      <div>
        <Thermometer className="mx-auto text-red-500" size={24} />
        <div className="font-bold">{avgTemp}°C</div>
        <div className="text-xs text-gray-500">Avg. Temp</div>
      </div>
      <div>
        <Droplets className="mx-auto text-blue-500" size={24} />
        <div className="font-bold">{avgHumidity}%</div>
        <div className="text-xs text-gray-500">Avg. Humidity</div>
      </div>
      <div>
        <Wind className="mx-auto text-teal-500" size={24} />
        <div className="font-bold">{avgWind} km/h</div>
        <div className="text-xs text-gray-500">Avg. Wind</div>
      </div>
      <div>
        <Thermometer className="mx-auto text-indigo-500" size={24} />
        <div className="font-bold">{maxPrecip} mm</div>
        <div className="text-xs text-gray-500">Max Precipitation</div>
      </div>
      <div className="col-span-2 border-t pt-4">
        <Gauge className="mx-auto text-green-500" size={24} />
        <div className="font-bold">AQI: {aqi}</div>
        <div className="text-xs text-gray-500">{category} Air Quality</div>
      </div>
    </div>
  );
}

function ShareButton({ eventSummary }) {
  const handleShare = async () => {
    try {
      const text = `Will It Rain ☔ for ${eventSummary.location} on ${eventSummary.date}: ${eventSummary.risk}% rain risk!`;
      const shareData = { title: 'Will It Rain ☔', text, url: window.location.href };

      // Prefer Web Share if supported (secure origins, supported browsers)
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        // Some browsers expose canShare; if present, check it
        if (typeof navigator.canShare === 'function') {
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        } else {
          await navigator.share(shareData);
          return;
        }
      }

      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('Event summary copied to clipboard!');
    } catch (err) {
      console.warn('Share failed, using fallback:', err);
      try {
        const text = `Will It Rain ☔ for ${eventSummary.location} on ${eventSummary.date}: ${eventSummary.risk}% rain risk!`;
        await navigator.clipboard.writeText(text);
        alert('Event summary copied to clipboard!');
      } catch (copyErr) {
        alert('Unable to share automatically. Please copy the URL from the address bar.');
      }
    }
  };
  return (
    <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={handleShare}>
      <Share2 size={18} />
      Share
    </button>
  );
}

function EventPlanningCard({ onQuery, queryMeta, loading }) {
  const now = new Date();
  const yyyyMMdd = formatDate(now, 'yyyy-MM-dd');
  const [location, setLocation] = useState('New Delhi, India');
  const [date, setDate] = useState(yyyyMMdd);
  const [startHour, setStartHour] = useState(10);
  const [endHour, setEndHour] = useState(14);
  const [showForm, setShowForm] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 28.6139, lon: 77.2090 });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const presets = [
    { name: '🎪 Outdoor Wedding', location: 'Mussoorie, India', start: 9, end: 15, lat: 30.4598, lon: 78.0664 },
    { name: '🎵 Music Concert', location: 'Delhi, India', start: 18, end: 22, lat: 28.6139, lon: 77.2090 },
    { name: '🏃 Marathon Event', location: 'Rishikesh, India', start: 6, end: 12, lat: 30.0869, lon: 78.2676 },
    { name: '🏖 Beach Party', location: 'Goa, India', start: 16, end: 23, lat: 15.2993, lon: 74.1240 },
    { name: '⛰ Mountain Trek', location: 'Manali, India', start: 7, end: 17, lat: 32.2396, lon: 77.1887 },
    { name: '🏏 Cricket Match', location: 'Mumbai, India', start: 14, end: 18, lat: 19.076, lon: 72.8777 },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onQuery({
      location,
      lat: coordinates.lat,
      lon: coordinates.lon,
      date,
      startHour: Number(startHour),
      endHour: Number(endHour),
    });
    setShowForm(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({ lat: position.coords.latitude, lon: position.coords.longitude });
          setLocation('Current Location');
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 md:p-6 text-white relative">
        <div className="relative">
          {/* Right-side controls */}
          <div className="absolute right-0 top-0 flex flex-col items-end gap-2">
            <ConnectionStatus online={isOnline} />
            <ResponsiveButton size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none" onClick={() => setShowForm(!showForm)}>
              <Settings size={16} />
            </ResponsiveButton>
          </div>

          {/* Centered title */}
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              <span className="inline-flex items-center gap-2">
                <span className="animate-bounce">☔</span>
                <span>Will It Rain</span>
              </span>
            </h2>
            <p className="text-indigo-100 text-sm md:text-base mt-1">Plan your perfect event</p>
          </div>
        </div>
      </div>

      {queryMeta && !showForm && (
        <div className="p-4 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-2xl">📍</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-lg">{queryMeta.location}</div>
              <div className="text-sm text-gray-600">
                {formatDate(queryMeta.date, 'MMM dd, yyyy')} • {String(queryMeta.startHour).padStart(2, '0')}:00 - {String(queryMeta.endHour).padStart(2, '0')}:00
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Lat: {queryMeta.lat?.toFixed(4)}, Lon: {queryMeta.lon?.toFixed(4)}
              </div>
            </div>
          </div>
          <ResponsiveButton className="w-full" onClick={() => setShowForm(true)}>
            {false ? 'Analyzing...' : 'Change Event Details'}
          </ResponsiveButton>
        </div>
      )}

      {(showForm || !queryMeta) && (
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={16} />
              Event Location
            </label>
            <div className="flex gap-2">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter city or venue"
              />
              <ResponsiveButton type="button" variant="secondary" size="md" onClick={getCurrentLocation} className="px-3">
                <Navigation size={16} />
              </ResponsiveButton>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Time</label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">End Time</label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>

          <ResponsiveButton type="submit" className="w-full" size="lg">
            <Zap size={18} />
            Check Weather Risk
          </ResponsiveButton>

          {!isOnline && (
            <div className="text-center text-sm text-red-600 flex items-center justify-center gap-2">
              <WifiOff size={16} />
              Internet connection required for weather updates
            </div>
          )}
        </form>
      )}
    </div>
  );
}

function RiskAssessmentCard({ forecast, eventWindow, message, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing weather patterns...</p>
      </div>
    );
  }
  if (!forecast) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
        <div className="text-6xl md:text-8xl mb-4">🌤</div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Ready to Check Weather</h3>
        <p className="text-gray-600 text-sm md:text-base">Enter your event details to get comprehensive rain risk analysis</p>
      </div>
    );
  }
  const risk = eventWindow?.windowInfo?.riskPct || 0;
  const windowInfo = eventWindow?.windowInfo || {};
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="text-center p-6 md:p-8">
        <div className="text-6xl md:text-8xl mb-4">{WeatherEmoji({ pop: risk / 100, temp: windowInfo.avgTemp })}</div>
        <div className="text-4xl md:text-6xl font-light text-gray-800 mb-2">{risk}%</div>
        <div className="text-lg md:text-xl text-gray-600 mb-4">Rain Probability During Event</div>
        <WeatherDetailsCard forecast={forecast} eventWindow={eventWindow} />
        {forecast.alerts && forecast.alerts.length > 0 && (
          <div className="mt-6">
            {forecast.alerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl mb-2 ${a.type === 'warning' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <span className="text-2xl">{a.icon}</span>
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        )}
        {message && <div className="mt-4 text-sm text-gray-500">{message}</div>}
      </div>
    </div>
  );
}

export default function Page() {
  const [queryMeta, setQueryMeta] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [eventWindow, setEventWindow] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleQuery(payload) {
    try {
      setLoading(true);
      setQueryMeta(payload);
      const data = await fetchWeatherAPI({ lat: payload.lat, lon: payload.lon, date: payload.date });
      setForecast(data);
      setEventWindow({
        windowInfo: computeWindowRisk(data.hourly, payload.startHour, payload.endHour),
        startHour: payload.startHour,
        endHour: payload.endHour,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent flex flex-col items-center py-8 px-2 sm:px-6">
      <div className="max-w-4xl w-full space-y-6">
        <EventPlanningCard onQuery={handleQuery} queryMeta={queryMeta} loading={loading} />
        <RiskAssessmentCard forecast={forecast} eventWindow={eventWindow} loading={loading} message="Powered by your Weather App" />
        {queryMeta && <MapCard lat={queryMeta.lat} lon={queryMeta.lon} location={queryMeta.location} />}
        {forecast && eventWindow && (
          <>
            <AnalyticsDashboard forecast={forecast} />
            <HourlyChart hourly={forecast.hourly} eventStart={eventWindow.startHour} eventEnd={eventWindow.endHour} />
          </>
        )}
      </div>
      <footer className="mt-8 text-xs text-gray-200/80 text-center">
        <span>✨ Planner demo – visit <code>/</code> for the main app</span>
      </footer>
    </main>
  );
}
