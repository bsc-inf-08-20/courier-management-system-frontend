'use client';

import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!; // Move key to .env

interface AgentMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

export default function AgentMap({ origin, destination }: AgentMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'], // optional, for future
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!isLoaded) return; // Wait for script to be loaded

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  }, [isLoaded, origin, destination]);

  if (!isLoaded) {
    return <p>Loading Map...</p>; // Display while loading
  }

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={origin}
        zoom={13}
      >
        <Marker
          position={origin}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          }}
          label="Agent"
        />
        <Marker
          position={destination}
          label="Customer"
        />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}
