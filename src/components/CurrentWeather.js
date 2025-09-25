'use client';

import { getWeatherIconUrl, formatTemperature } from '../services/weatherApi';
import { formatPressure, formatHumidity, formatWindSpeed, formatVisibility } from '../utils/weatherUtils';
import { SmartIcon } from '../utils/icons';

const CurrentWeather = ({ weatherData }) => {
  if (!weatherData) return null;

  const {
    name,
    sys: { country },
    main: { temp, humidity, pressure },
    weather: [currentWeather],
    wind: { speed },
    visibility,
    dt
  } = weatherData;

  const currentDate = new Date(dt * 1000);
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
      {/* Main Weather Display */}
      <div className="text-center mb-8">
        {/* Smart, minimal icon (adapts to condition + temperature) */}
        <div className="flex items-center justify-center mb-4">
          <SmartIcon temp={temp} condition={currentWeather.main} size={110} />
        </div>
        
        <div className="text-6xl font-light text-white mb-2">
          {formatTemperature(temp)}°C
        </div>
        
        <div className="text-xl text-white/90 mb-2">
          {name}, {country}
        </div>
        
        <div className="flex items-center justify-center gap-2 text-lg text-white/80 capitalize mb-2">
          <img
            src={getWeatherIconUrl(currentWeather.icon)}
            alt={currentWeather.description}
            className="w-7 h-7"
          />
          <span>{currentWeather.description}</span>
        </div>
        
        <div className="text-sm text-white/70">
          {formattedDate} | {formattedTime}
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-white/70 text-sm">Humidity</div>
            <div className="text-white font-medium">{formatHumidity(humidity)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-white/70 text-sm">Wind</div>
            <div className="text-white font-medium">{formatWindSpeed(speed)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div>
            <div className="text-white/70 text-sm">Pressure</div>
            <div className="text-white font-medium">{formatPressure(pressure)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-white/70 text-sm">Visibility</div>
            <div className="text-white font-medium">{formatVisibility(visibility)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
