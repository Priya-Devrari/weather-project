import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Create axios instance with default config
const weatherApi = axios.create({
  baseURL: BASE_URL,
  params: {
    appid: API_KEY,
    units: 'metric' // Use Celsius
  }
});

// Get current weather by city name
export const getCurrentWeather = async (city) => {
  try {
    const response = await weatherApi.get('/weather', {
      params: { q: city }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch weather data');
  }
};

// Get current weather by coordinates
export const getCurrentWeatherByCoords = async (lat, lon) => {
  try {
    const response = await weatherApi.get('/weather', {
      params: { lat, lon }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch weather data');
  }
};

// Get 5-day forecast (includes hourly data)
export const getFiveDayForecast = async (city) => {
  try {
    const response = await weatherApi.get('/forecast', {
      params: { q: city }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch forecast data');
  }
};

// Get 5-day forecast by coordinates
export const getFiveDayForecastByCoords = async (lat, lon) => {
  try {
    const response = await weatherApi.get('/forecast', {
      params: { lat, lon }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch forecast data');
  }
};

// Helper function to get weather icon URL
export const getWeatherIconUrl = (iconCode, size = '2x') => {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
};

// Helper function to format temperature
export const formatTemperature = (temp) => {
  return Math.round(temp);
};

// Helper function to format date
export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format time
export const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  });
};

// Helper function to get day name
export const getDayName = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'long'
  });
};
