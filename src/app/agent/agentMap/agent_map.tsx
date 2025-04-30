'use client';

import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useMemo } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

interface Coordinate {
  lat: number;
  lng: number;
}

interface AgentMapProps {
  origin?: Coordinate | null;
  destination?: Coordinate | null;
}

// Enhanced coordinate validation with TypeScript type guard
function isValidCoordinate(coord: any): coord is Coordinate {
  if (!coord) return false;
  
  const lat = coord.lat;
  const lng = coord.lng;
  
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

// Default fallback position (center of the map)
const DEFAULT_CENTER = { lat: 0, lng: 0 };

export default function AgentMap({ origin, destination }: AgentMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize safe coordinates to prevent unnecessary recalculations
  const safeOrigin = useMemo(() => {
    return isValidCoordinate(origin) ? origin : DEFAULT_CENTER;
  }, [origin]);

  const safeDestination = useMemo(() => {
    return isValidCoordinate(destination) ? destination : DEFAULT_CENTER;
  }, [destination]);

  // Calculate zoom level based on coordinate validity
  const zoomLevel = useMemo(() => {
    return isValidCoordinate(origin) ? 13 : 2;
  }, [origin]);

  useEffect(() => {
    if (!isLoaded) return;

    // Reset previous state
    setDirections(null);
    setError(null);

    // Skip directions request if coordinates are invalid
    if (!isValidCoordinate(origin) || !isValidCoordinate(destination)) {
      setError('Invalid location data provided');
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        } else {
          setError(`Failed to calculate route: ${status}`);
        }
      }
    );
  }, [isLoaded, origin, destination]);

  if (loadError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        Error: Failed to load Google Maps. Please check your API key and network connection.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-4 bg-blue-100 text-blue-700 rounded-md animate-pulse">
        Loading map data...
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full border rounded-md overflow-hidden">
      {/* Error message overlay */}
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-yellow-100 text-yellow-800 p-2 rounded-md shadow-sm z-10">
        {error}
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={safeOrigin}
        zoom={zoomLevel}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Only render markers if coordinates are valid */}
        {isValidCoordinate(origin) && (
          <Marker
            position={origin}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new google.maps.Size(32, 32),
            }}
            label="A"
          />
        )}

        {isValidCoordinate(destination) && (
          <Marker
            position={destination}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(32, 32),
            }}
            label="B"
          />
        )}

        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}