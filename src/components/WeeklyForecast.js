'use client';

import { getWeatherIconUrl, getDayName } from '../services/weatherApi';
import { processDailyForecast, formatHumidity } from '../utils/weatherUtils';

const WeeklyForecast = ({ forecastData }) => {
  if (!forecastData) return null;

  const dailyData = processDailyForecast(forecastData);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold text-white mb-6">This Week</h2>

      <div className="space-y-4">
        {dailyData.map((day, index) => {
          const dayName = index === 0 ? 'Today' : getDayName(day.date);
          
          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 text-left">
                  <div className="text-white font-medium">
                    {dayName}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <img
                    src={getWeatherIconUrl(day.weather.icon)}
                    alt={day.weather.description}
                    className="w-10 h-10"
                  />
                  <div className="text-white/80 capitalize text-sm">
                    {day.weather.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-white/70 text-xs">Humidity</div>
                  <div className="text-white text-sm">{formatHumidity(day.humidity)}</div>
                </div>
                
                <div className="text-right min-w-[80px]">
                  <div className="text-white font-medium">
                    {day.tempMax}°/{day.tempMin}°
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyForecast;
