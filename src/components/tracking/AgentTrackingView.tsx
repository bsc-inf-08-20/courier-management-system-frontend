// components/tracking/AgentTrackingView.tsx
"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "@/hooks/agentAuth";

interface Packet {
  id: number;
  description: string;
  status: string;
  origin_coordinates?: { lat: number; lng: number } | null;
  destination_coordinates?: { lat: number; lng: number } | null;
  assigned_pickup_agent?: { user_id: number };
  assigned_delivery_agent?: { user_id: number };
  hasCoordinates?: boolean;
  [key: string]: any;
}

type AgentTrackingViewProps = {
  apiKey: string;
  arrivalThresholdMeters: number;
  agentId: number;
  mode: "collect" | "deliver";
};

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const mapOptions = {
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
};

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const processPackets = (packets: Packet[], coordinateField: string) => {
  return packets.map(packet => ({
    ...packet,
    hasCoordinates: Boolean(
      packet[coordinateField]?.lat && 
      packet[coordinateField]?.lng
    )
  }));
};

const AgentTrackingView: React.FC<AgentTrackingViewProps> = ({
  apiKey,
  arrivalThresholdMeters = 100,
  agentId,
  mode,
}) => {
  const { decodedToken } = useAuth("AGENT");

  const [agentLocation, setAgentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [closestPacket, setClosestPacket] = useState<Packet | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [travelInfo, setTravelInfo] = useState({
    distance: "N/A",
    duration: "N/A",
  });
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);

  // Add this function to handle map loads
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setIsGoogleMapsLoaded(true);
    setIsLoading(false);
  }, []);

  // Create memoized marker configurations
  const markerConfigs = useMemo(() => {
    if (!isGoogleMapsLoaded || !window.google) return null;
    
    return {
      agent: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        scaledSize: new window.google.maps.Size(40, 40)
      },
      selected: {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        scaledSize: new window.google.maps.Size(40, 40)
      },
      closest: {
        url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        scaledSize: new window.google.maps.Size(40, 40)
      },
      default: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(40, 40)
      }
    };
  }, [isGoogleMapsLoaded]);

  // Determine endpoint and coordinate field based on mode
  const endpoint =
    mode === "collect"
      ? `/packets/agents/${agentId}/assigned-packets`
      : `/packets/agents/${agentId}/packets-deliver`;
  const coordinateField = mode === "collect" ? "origin_coordinates" : "destination_coordinates";

  useEffect(() => {
    const fetchPackets = async () => {
      try {
        if (!agentId) {
          console.log("[Debug] Agent ID is missing:", agentId);
          setError("Authentication error. Please login again.");
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          console.log("[Debug] Token is missing");
          setError("Authentication token not found");
          return;
        }

        console.log("[Debug] Making request for agent:", agentId);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[Debug] Error response:", errorText);
          throw new Error(`Failed to fetch packets: ${errorText}`);
        }

        const data = await response.json();
        console.log("[Debug] Raw packets data:", data);

        // Process and filter packets
        const processedPackets = processPackets(data, coordinateField);
        console.log("[Debug] Processed packets:", processedPackets);

        // Count packets with valid coordinates
        const packetsWithCoordinates = processedPackets.filter(p => p.hasCoordinates);
        console.log("[Debug] Packets with valid coordinates:", packetsWithCoordinates.length);

        setPackets(processedPackets);
        setError(null);

        if (packetsWithCoordinates.length === 0) {
          toast.warning("No packets with valid coordinates available");
        }

      } catch (error) {
        console.error("[Debug] Fetch error:", error);
        setError(typeof error === 'string' ? error : "Failed to load packets");
      }
    };

    fetchPackets();
  }, [agentId, mode]);

  // Track agent's real-time location
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser", {
        autoClose: 5000
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setAgentLocation(newLocation);
        setError(null); // Clear any previous errors
      },
      (error) => {
        const errorMessage = "Unable to retrieve your location. Please enable location services.";
        toast.error(errorMessage, {
          autoClose: 5000
        });
        setError(errorMessage);
      },
      options
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Calculate the closest packet based on agent's location
  useEffect(() => {
    if (agentLocation && packets.length > 0) {
      let minDistance = Infinity;
      let closest: Packet | null = null;

      packets.forEach((packet) => {
        if (packet[coordinateField] && packet.hasCoordinates) {
          const distance = calculateDistance(
            agentLocation.lat,
            agentLocation.lng,
            packet[coordinateField]!.lat,
            packet[coordinateField]!.lng
          );
          if (distance < minDistance) {
            minDistance = distance;
            closest = packet;
          }
        }
      });

      console.log("[AgentTrackingView] Closest packet:", closest);
      setClosestPacket(closest);
    }
  }, [agentLocation, packets, coordinateField]);

  // Calculate directions when packet is selected
  useEffect(() => {
    if (
      selectedPacket &&
      agentLocation &&
      window.google &&
      selectedPacket[coordinateField]
    ) {
      const directionsService = new window.google.maps.DirectionsService();
      interface TravelInfo {
        distance: string;
        duration: string;
      }

      interface DirectionsLeg {
        distance?: { text: string };
        duration?: { text: string };
      }

      interface DirectionsRoute {
        legs?: DirectionsLeg[];
      }

      interface DirectionsResult {
        routes?: DirectionsRoute[];
      }

      directionsService.route(
        {
          origin: agentLocation,
          destination: selectedPacket[coordinateField]!,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === "OK" && result?.routes?.[0]?.legs?.[0]) {
        setDirections(result as google.maps.DirectionsResult);
        setTravelInfo({
          distance: result.routes[0].legs[0].distance?.text || "N/A",
          duration: result.routes[0].legs[0].duration?.text || "N/A",
        });
          } else {
        console.warn(
          "[AgentTrackingView] Directions request failed:",
          status
        );
        setDirections(null);
        setTravelInfo({ distance: "N/A", duration: "N/A" });
          }
        }
      );
    } else {
      setDirections(null);
      setTravelInfo({ distance: "N/A", duration: "N/A" });
    }
  }, [selectedPacket, agentLocation, coordinateField]);

  const checkArrival = useCallback(
    (
      agentLoc: { lat: number; lng: number },
      packetLoc: { lat: number; lng: number }
    ) => {
      const threshold = 100; // 100 meters
      const distance =
        calculateDistance(
          agentLoc.lat,
          agentLoc.lng,
          packetLoc.lat,
          packetLoc.lng
        ) * 1000; // Convert km to meters

      if (distance <= threshold && !hasArrived) {
        setHasArrived(true);
        toast.success("You have arrived at the packet location!");
        // Optional: Play sound
        new Audio("/arrival-sound.mp3").play().catch(console.error);
      }
    },
    [hasArrived]
  );

  // This effect keeps the map view updated on selection/location change
  useEffect(() => {
    if (!mapRef.current) return;

    if (agentLocation && selectedPacket?.[coordinateField]) {
      // Fit both agent and packet in view
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(agentLocation);
      bounds.extend(selectedPacket[coordinateField]!);
      mapRef.current.fitBounds(bounds, 100); // 100px padding
    } else if (selectedPacket?.[coordinateField]) {
      // Center on packet if agent location is missing
      mapRef.current.panTo(selectedPacket[coordinateField]!);
      mapRef.current.setZoom(15);
    } else if (agentLocation) {
      // Center on agent if no packet selected
      mapRef.current.panTo(agentLocation);
      mapRef.current.setZoom(15);
    }
  }, [agentLocation, selectedPacket, coordinateField]);

  useEffect(() => {
    console.log({
      agentId,
      token: localStorage.getItem("token"),
      decodedToken: JSON.stringify(decodedToken, null, 2)
    });
  }, [agentId, decodedToken]);

  const handlePacketSelection = useCallback((packetId: string) => {
    const packet = packets.find((p) => p.id === Number(packetId));
    setSelectedPacket(packet || null);
    
    if (packet?.[coordinateField]) {
      mapRef.current?.panTo(packet[coordinateField]!);
      mapRef.current?.setZoom(15);
    }
  }, [packets, coordinateField]);

  useEffect(() => {
    if (mapRef.current && agentLocation && selectedPacket?.[coordinateField]) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(agentLocation);
      bounds.extend(selectedPacket[coordinateField]!);
      mapRef.current.fitBounds(bounds, 50); // 50px padding
    }
  }, [agentLocation, selectedPacket, coordinateField]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Navigation</h1>

      {error && (
        <div className="bg-red-50 p-3 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {packets.length > 0 && !packets.some(p => p.hasCoordinates) && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
          <p className="text-yellow-700">
            ⚠️ None of the available packets have valid coordinates. Please contact support.
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-2">Select Packet:</label>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => handlePacketSelection(e.target.value)}
          value={selectedPacket?.id || ""}
        >
          <option value="">-- Select a packet --</option>
          {packets.length === 0 ? (
            <option disabled>No packets available</option>
          ) : (
            packets.map((packet) => (
              <option 
                key={packet.id} 
                value={packet.id}
                disabled={!packet.hasCoordinates}
              >
                #{packet.id} - {packet.description} ({packet.status})
                {!packet.hasCoordinates ? " (No coordinates)" : ""}
                {packet.hasCoordinates && closestPacket?.id === packet.id ? " (Closest)" : ""}
              </option>
            ))
          )}
        </select>
      </div>

      {closestPacket && closestPacket[coordinateField] && (
        <div className="bg-green-50 p-3 rounded mb-4">
          <p>
            Closest Packet: #{closestPacket.id} - {closestPacket.description}
          </p>
          <p>
            Distance to Pickup:{" "}
            {agentLocation
              ? `${calculateDistance(
                  agentLocation.lat,
                  agentLocation.lng,
                  closestPacket[coordinateField]!.lat,
                  closestPacket[coordinateField]!.lng
                ).toFixed(2)} km`
              : "Calculating..."}
          </p>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded mb-4">
        <p>Route Distance: {travelInfo.distance}</p>
        <p>Estimated Time: {travelInfo.duration}</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <LoadScript 
          googleMapsApiKey={apiKey}
          onLoad={() => setIsGoogleMapsLoaded(true)}
          onError={(error) => {
            console.error("Google Maps loading error:", error);
            setError("Failed to load Google Maps");
          }}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={agentLocation || selectedPacket?.[coordinateField] || { lat: 0, lng: 0 }}
            zoom={14}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {isGoogleMapsLoaded && markerConfigs && (
              <>
                {agentLocation && (
                  <Marker
                    position={agentLocation}
                    icon={markerConfigs.agent}
                  />
                )}

                {packets.map((packet) =>
                  packet[coordinateField] && packet.hasCoordinates && (
                    <Marker
                      key={packet.id}
                      position={packet[coordinateField]!}
                      icon={
                        selectedPacket?.id === packet.id
                          ? markerConfigs.selected
                          : closestPacket?.id === packet.id
                          ? markerConfigs.closest
                          : markerConfigs.default
                      }
                      animation={
                        selectedPacket?.id === packet.id 
                          ? google.maps.Animation.BOUNCE 
                          : undefined
                      }
                      onClick={() => handlePacketSelection(packet.id.toString())}
                    />
                  )
                )}

                {directions && (
                  <DirectionsRenderer
                    options={{
                      directions,
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: "#3b82f6",
                        strokeWeight: 5,
                      },
                    }}
                  />
                )}
              </>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="space-y-2 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {hasArrived && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
          <h3 className="font-bold">You've Arrived! 🎉</h3>
          <p>You are at the packet location</p>
        </div>
      )}

      {agentLocation && selectedPacket && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10">
          <h3 className="font-semibold text-lg mb-2">Navigation Info</h3>
          <div className="space-y-2">
            <p>Distance: {travelInfo.distance}</p>
            <p>ETA: {travelInfo.duration}</p>
            <p className="text-sm text-gray-600">
              {hasArrived ? "✅ Arrived" : "🚗 En Route"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTrackingView;
