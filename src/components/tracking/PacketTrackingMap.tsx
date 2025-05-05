'use client';
import { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
}

interface PacketTrackingMapProps {
  packetId: number;
  apiKey: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '70vh',
};

const PacketTrackingMap: React.FC<PacketTrackingMapProps> = ({ packetId, apiKey }) => {
  const [agentLocation, setAgentLocation] = useState<Location | null>(null);
  const [packetLocation, setPacketLocation] = useState<Location | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Fetch packet coordinates
  useEffect(() => {
    const fetchPacketLocation = async () => {
      try {
        const response = await fetch(`/api/packets/${packetId}/coordinates`);
        const data = await response.json();
        setPacketLocation(data);
      } catch (error) {
        console.error('Error fetching packet location:', error);
      }
    };

    fetchPacketLocation();
  }, [packetId]);

  // Track agent's location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setAgentLocation(newLocation);

        // Check if agent has arrived (within 50 meters)
        if (packetLocation && calculateDistance(newLocation, packetLocation) < 0.05) {
          setHasArrived(true);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [packetLocation]);

  const calculateDistance = (loc1: Location, loc2: Location) => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const directionsCallback = (response: any) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      setDistance(response.routes[0].legs[0].distance.text);
      setDuration(response.routes[0].legs[0].duration.text);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Package Tracking</h2>
        
        {distance && duration && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-500">Distance</p>
              <p className="font-medium">{distance}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-gray-500">Estimated Time</p>
              <p className="font-medium">{duration}</p>
            </div>
          </div>
        )}

        {hasArrived && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
            <p className="font-medium text-green-700">You have arrived at the destination!</p>
          </div>
        )}
      </div>

      <div className="rounded-lg overflow-hidden shadow-lg">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={agentLocation || { lat: 0, lng: 0 }}
            zoom={14}
          >
            {agentLocation && (
              <Marker 
                position={agentLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }}
              />
            )}

            {packetLocation && (
              <Marker 
                position={packetLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }}
              />
            )}

            {agentLocation && packetLocation && (
              <DirectionsService
                options={{
                  destination: packetLocation,
                  origin: agentLocation,
                  travelMode: google.maps.TravelMode.DRIVING
                }}
                callback={directionsCallback}
              />
            )}

            {directions && (
              <DirectionsRenderer
                options={{
                  directions,
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#3b82f6',
                    strokeWeight: 5
                  }
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default PacketTrackingMap;