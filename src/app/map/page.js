'use client';

import dynamic from 'next/dynamic';

const WeatherMap = dynamic(() => import('../../components/WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center text-white/80">
      Loading interactive map...
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Interactive Weather Map</h1>
          <p className="text-white/80 mt-2">Zoom and pan to explore current conditions across regions. Use layer control for overlays.</p>
        </div>
        <WeatherMap />
      </div>
    </div>
  );
}
