# WeatherNow - Next.js Weather Application

A modern, responsive weather application built with Next.js, featuring real-time weather data, forecasts, and a beautiful UI inspired by modern weather apps.

![WeatherNow Preview](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=WeatherNow+Weather+App)

## ✨ Features

- **🔍 City Search**: Search for weather by city name with autocomplete
- **📍 Location Detection**: Automatic weather detection using geolocation
- **🌡️ Current Weather**: Temperature, humidity, wind speed, pressure, and visibility
- **⏰ Hourly Forecast**: Next 8 hours weather forecast
- **📅 Weekly Forecast**: 7-day weather forecast with highs/lows
- **🎨 Modern UI**: Beautiful glassmorphism design with Tailwind CSS
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **⚡ Fast Loading**: Optimized API calls and loading states
- **🚨 Error Handling**: Graceful error handling with retry functionality

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env.local
   
   # Edit .env.local and add your OpenWeatherMap API key
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Setup

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Add the key to your `.env.local` file

## 🏗️ Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.js           # Root layout
│   └── page.js             # Main weather page
├── components/
│   ├── SearchBar.js        # City search component
│   ├── CurrentWeather.js   # Current weather display
│   ├── HourlyForecast.js   # Hourly forecast component
│   ├── WeeklyForecast.js   # Weekly forecast component
│   ├── LoadingSpinner.js   # Loading state component
│   └── ErrorMessage.js     # Error handling component
├── services/
│   └── weatherApi.js       # Weather API service
└── utils/
    └── weatherUtils.js     # Weather data utilities
```

## 🎨 Design Features

- **Glassmorphism UI**: Modern glass-like effects with backdrop blur
- **Gradient Backgrounds**: Beautiful blue gradient backgrounds
- **Weather Icons**: Official OpenWeatherMap weather icons
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Smooth Animations**: Subtle transitions and loading animations
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Perfect layout for tablets
- **Desktop Enhanced**: Rich desktop experience with larger displays

## 🔧 Technologies Used

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with hooks
- **Tailwind CSS 4**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **OpenWeatherMap API**: Weather data provider

## 🌐 API Endpoints Used

- **Current Weather**: `/weather` - Current weather conditions
- **5-Day Forecast**: `/forecast` - 5-day weather forecast with 3-hour intervals
- **Weather Icons**: OpenWeatherMap icon service

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically

### Other platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for the framework
- Weather icons from OpenWeatherMap

---

Built with ❤️ using Next.js and Tailwind CSS
