import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

interface MapComponentProps {
  initialCenter: { lat: number; lng: number };
  onLocationSelect: (coordinates: { lat: number; lng: number }) => void;
  selectedCoordinates?: { lat: number; lng: number };
  label?: string;
  onAddressChange?: (address: string) => void;
  addressInputValue?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

const libraries: ("places" | "geometry" | "drawing")[] = ["places"];

export function MapComponent({
  initialCenter,
  onLocationSelect,
  selectedCoordinates,
  label = "Select location",
  onAddressChange,
  addressInputValue,
}: MapComponentProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (map && selectedCoordinates) {
      map.panTo(selectedCoordinates);
      map.setZoom(15);
    }
  }, [selectedCoordinates, map]);

  const handlePlaceSelect = () => {
    if (!searchBox) return;

    const place = searchBox.getPlace();
    if (place.geometry?.location) {
      const coords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      onLocationSelect(coords);
      if (onAddressChange && place.formatted_address) {
        onAddressChange(place.formatted_address);
      }
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    onLocationSelect(coords);
    // Reverse geocode to get address
    if (onAddressChange) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          onAddressChange(results[0].formatted_address);
        }
      });
    }
  };

  if (loadError) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        Error loading maps. Please try again later.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="space-y-4">
        <Autocomplete onLoad={setSearchBox} onPlaceChanged={handlePlaceSelect}>
          <input
            type="text"
            placeholder="Search for a location"
            className="w-full px-4 py-2 border rounded-md"
            value={addressInputValue}
            onChange={(e) => onAddressChange?.(e.target.value)}
          />
        </Autocomplete>
        {selectedCoordinates && (
          <p className="text-sm text-gray-600">
            Selected coordinates: {selectedCoordinates.lat.toFixed(6)},{" "}
            {selectedCoordinates.lng.toFixed(6)}
          </p>
        )}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedCoordinates || initialCenter}
          zoom={13}
          options={mapOptions}
          onClick={handleMapClick}
          onLoad={setMap}
        >
          {selectedCoordinates && (
            <Marker
              position={selectedCoordinates}
              animation={window.google?.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
