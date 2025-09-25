// Process forecast data to get daily summaries
export const processDailyForecast = (forecastData) => {
  const dailyData = {};
  
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date: item.dt,
        temps: [],
        humidity: [],
        weather: item.weather[0],
        wind: item.wind
      };
    }
    
    dailyData[date].temps.push(item.main.temp);
    dailyData[date].humidity.push(item.main.humidity);
  });
  
  // Convert to array and calculate min/max temps and average humidity
  return Object.values(dailyData).map(day => ({
    date: day.date,
    tempMax: Math.round(Math.max(...day.temps)),
    tempMin: Math.round(Math.min(...day.temps)),
    humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
    weather: day.weather,
    wind: day.wind
  })).slice(0, 7); // Get 7 days
};

// Process forecast data to get hourly data for today
export const processHourlyForecast = (forecastData) => {
  const today = new Date().toDateString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
  
  return forecastData.list
    .filter(item => {
      const itemDate = new Date(item.dt * 1000).toDateString();
      return itemDate === today || itemDate === tomorrow;
    })
    .slice(0, 8) // Get next 8 hours
    .map(item => ({
      time: item.dt,
      temp: Math.round(item.main.temp),
      weather: item.weather[0],
      humidity: item.main.humidity,
      wind: item.wind
    }));
};

// Get weather condition emoji
export const getWeatherEmoji = (weatherMain) => {
  const weatherEmojis = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️'
  };
  
  return weatherEmojis[weatherMain] || '🌤️';
};

// Convert wind direction from degrees to compass
export const getWindDirection = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Format pressure value
export const formatPressure = (pressure) => {
  return `${pressure} hPa`;
};

// Format humidity value
export const formatHumidity = (humidity) => {
  return `${humidity}%`;
};

// Format wind speed
export const formatWindSpeed = (speed) => {
  return `${Math.round(speed * 3.6)} km/h`; // Convert m/s to km/h
};

// Format visibility
export const formatVisibility = (visibility) => {
  return `${Math.round(visibility / 1000)} km`;
};
