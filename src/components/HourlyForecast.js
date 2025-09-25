'use client';

import { getWeatherIconUrl, formatTime } from '../services/weatherApi';
import { processHourlyForecast } from '../utils/weatherUtils';

const HourlyForecast = ({ forecastData }) => {
  if (!forecastData) return null;

  const hourlyData = processHourlyForecast(forecastData);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Today (Hourly)</h2>
        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {hourlyData.map((hour, index) => (
          <div
            key={index}
            className="flex-shrink-0 text-center min-w-[80px] p-3 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="text-sm text-white/70 mb-2">
              {formatTime(hour.time)}
            </div>
            
            <div className="mb-2">
              <img
                src={getWeatherIconUrl(hour.weather.icon)}
                alt={hour.weather.description}
                className="w-12 h-12 mx-auto"
              />
            </div>
            
            <div className="text-lg font-medium text-white mb-1">
              {hour.temp}°
            </div>
            
            <div className="text-xs text-white/60">
              {hour.humidity}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;
