import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Axios instance with default params
const weatherApi = axios.create({
  baseURL: BASE_URL,
  params: {
    appid: API_KEY,
    units: 'metric',
  },
});

// Fetch weather for multiple city names
export const getWeatherForCities = async (cities) => {
  const results = [];
  for (const city of cities) {
    try {
      const response = await weatherApi.get('/weather', { params: { q: city } });
      results.push({ city, data: response.data, error: null });
    } catch (error) {
      results.push({ city, data: null, error: error.response?.data?.message || 'Failed' });
    }
  }
  return results;
};

// Fetch weather for multiple coordinates
export const getWeatherForCoordsList = async (coordsList) => {
  const results = [];
  for (const { lat, lon, name } of coordsList) {
    try {
      const response = await weatherApi.get('/weather', { params: { lat, lon } });
      results.push({ name, lat, lon, data: response.data, error: null });
    } catch (error) {
      results.push({ name, lat, lon, data: null, error: error.response?.data?.message || 'Failed' });
    }
  }
  return results;
};