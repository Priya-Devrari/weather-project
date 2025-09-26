'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function PlannerLeafletMap({ lat, lon, location }) {
  // Render a fresh map instance; parent can control with key
  return (
    <MapContainer center={[lat, lon]} zoom={13} style={{ height: '250px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lon]}>
        <Popup>{location}</Popup>
      </Marker>
    </MapContainer>
  );
}
