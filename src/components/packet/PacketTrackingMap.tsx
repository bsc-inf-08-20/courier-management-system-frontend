'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';   // Changed import to get the type correctly

interface Location {
  lat: number;
  lng: number;
}

interface Packet {
  id: number;
  status: string;
  origin_coordinates: Location;
  destination_coordinates: Location;
  description: string;
}

interface PacketTrackingMapProps {
  apiKey: string;
  backendUrl: string;
  userId: number;
  initialPacketId?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '70vh',
};

const PacketTrackingMap: React.FC<PacketTrackingMapProps> = ({
  apiKey,
  backendUrl,
  userId,
  initialPacketId,
}) => {
  const [agentLocation, setAgentLocation] = useState<Location | null>(null);
  const [packet, setPacket] = useState<Packet | null>(null);
  const [assignedPackets, setAssignedPackets] = useState<Packet[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [travelInfo, setTravelInfo] = useState({
    distance: '',
    duration: '',
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info' as 'info' | 'success' | 'error',
  });
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 0, lng: 0 });
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const directionsCallbackCount = useRef(0);

  // Initialize WebSocket connection
  useEffect(() => {
    socketRef.current = io(`${backendUrl}/tracking`, {
      query: { userId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }) ; 

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to tracking server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from tracking server');
    });

    socketRef.current.on('assigned_packets', (packets: Packet[]) => {
      setAssignedPackets(packets);
      if (packets.length > 0 && !initialPacketId) {
        setPacket(packets[0]);
      }
    });

    socketRef.current.on('location_reached', (data: {
      packetId: number;
      locationType: 'origin' | 'destination';
    }) => {
      const message = data.locationType === 'origin'
        ? 'You have reached the pickup location!'
        : 'You have reached the delivery destination!';
      
      showNotification(message, 'success');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [backendUrl, userId, initialPacketId]);

  // Fetch initial packet data
  useEffect(() => {
    if (initialPacketId) {
      fetch(`${backendUrl}/packets/${initialPacketId}`)
        .then(res => res.json())
        .then(setPacket)
        .catch(console.error);
    }
  }, [initialPacketId, backendUrl]);

  // Start tracking agent's location
  useEffect(() => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser', 'error');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setAgentLocation(newLocation);
        
        // Center map on agent if no packet is selected
        if (!packet) {
          setMapCenter(newLocation);
        }

        // Send update to server
        if (socketRef.current?.connected) {
          socketRef.current.emit('update_location', newLocation);
        }
      },
      (error) => {
        showNotification(`Geolocation error: ${error.message}`, 'error');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [packet]);

  // Update packet status
  const updatePacketStatus = (status: string) => {
    if (!packet || !socketRef.current) return;

    socketRef.current.emit('packet_status_update', {
      packetId: packet.id,
      status,
    });

    showNotification(`Packet status updated to ${status.replace('_', ' ')}`, 'success');
  };

  const showNotification = (message: string, type: 'info' | 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const directionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    // Prevent multiple calls from DirectionsService
    directionsCallbackCount.current += 1;
    if (directionsCallbackCount.current > 1) return;

    if (status === 'OK' && result) {
      setDirections(result);
      
      const route = result.routes[0];
      if (route?.legs[0]) {
        setTravelInfo({
          distance: route.legs[0].distance?.text || '',
          duration: route.legs[0].duration?.text || '',
        });
      }
    } else {
      console.error('Directions request failed:', status);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      <div className={`p-2 text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {isConnected ? 'Connected to tracking server' : 'Disconnected from tracking server'}
      </div>

      {/* Packet selector */}
      <div className="p-4 bg-gray-50">
        <label htmlFor="packet-select" className="block text-sm font-medium text-gray-700">
          Select Packet
        </label>
        <select
          id="packet-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={packet?.id || ''}
          onChange={(e) => {
            const selectedPacket = assignedPackets.find(p => p.id === Number(e.target.value));
            setPacket(selectedPacket || null);
          }}
        >
          <option value="">Select a packet</option>
          {assignedPackets.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.id} - {p.description} ({p.status})
            </option>
          ))}
        </select>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={14}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {/* Agent marker */}
            {agentLocation && (
              <Marker
                position={agentLocation}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new google.maps.Size(40, 40),
                }}
                title="Your Location"
              />
            )}

            {/* Packet origin marker */}
            {packet?.origin_coordinates && (
              <Marker
                position={packet.origin_coordinates}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new google.maps.Size(40, 40),
                }}
                title="Pickup Location"
              />
            )}

            {/* Packet destination marker */}
            {packet?.destination_coordinates && (
              <Marker
                position={packet.destination_coordinates}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: new google.maps.Size(40, 40),
                }}
                title="Delivery Destination"
              />
            )}

            {/* Directions service */}
            {agentLocation && packet?.origin_coordinates && (
              <DirectionsService
                options={{
                  origin: agentLocation,
                  destination: packet.origin_coordinates,
                  travelMode: google.maps.TravelMode.DRIVING,
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
                    strokeWeight: 5,
                  },
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Information panel */}
      <div className="p-4 bg-white border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Information</h3>
        
        {packet && (
          <div className="space-y-2">
            <p><span className="font-medium">Packet ID:</span> #{packet.id}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                packet.status === 'delivered' ? 'bg-green-100 text-green-800' :
                packet.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {packet.status.replace('_', ' ')}
              </span>
            </p>
            
            {travelInfo.distance && (
              <p><span className="font-medium">Distance:</span> {travelInfo.distance}</p>
            )}
            
            {travelInfo.duration && (
              <p><span className="font-medium">Estimated Time:</span> {travelInfo.duration}</p>
            )}
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => updatePacketStatus('collected')}
                disabled={packet.status !== 'pending'}
                className={`px-3 py-2 text-sm rounded-md ${
                  packet.status !== 'pending' 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Mark as Collected
              </button>
              
              <button
                onClick={() => updatePacketStatus('delivered')}
                disabled={packet.status !== 'out_for_delivery'}
                className={`px-3 py-2 text-sm rounded-md ${
                  packet.status !== 'out_for_delivery' 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Mark as Delivered
              </button>
            </div>
          </div>
        )}
        
        {!packet && (
          <p className="text-gray-500">No packet selected</p>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default PacketTrackingMap;