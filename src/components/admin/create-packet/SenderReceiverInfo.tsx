// // components/MapWrapper.tsx
// "use client";

// import dynamic from "next/dynamic";
// import { LatLng } from "leaflet";
// import { useRef, useEffect } from "react";

// const MapContainer = dynamic(
//   () => import("react-leaflet").then((mod) => mod.MapContainer),
//   { ssr: false }
// );
// const TileLayer = dynamic(
//   () => import("react-leaflet").then((mod) => mod.TileLayer),
//   { ssr: false }
// );
// const Marker = dynamic(
//   () => import("react-leaflet").then((mod) => mod.Marker),
//   { ssr: false }
// );
// const Popup = dynamic(
//   () => import("react-leaflet").then((mod) => mod.Popup),
//   { ssr: false }
// );
// const useMapEvents = dynamic(
//   () => import("react-leaflet").then((mod) => mod.useMapEvents),
//   { ssr: false }
// );

// interface MapClickHandlerProps {
//   onClick: (e: { latlng: LatLng }) => void;
// }

// export function MapClickHandler({ onClick }: MapClickHandlerProps) {
//   const map = useMapEvents({
//     click(e) {
//       onClick(e);
//     },
//   });
//   return null;
// }

// interface MapWrapperProps {
//   center: [number, number];
//   zoom: number;
//   children: React.ReactNode;
// }

// export function MapWrapper({ center, zoom, children }: MapWrapperProps) {
//   const mapRef = useRef(null);

//   // Initialize Leaflet icon settings
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const L = require("leaflet");
//       delete (L.Icon.Default.prototype as any)._getIconUrl;
//       L.Icon.Default.mergeOptions({
//         iconUrl: "/images/marker-icon.png",
//         iconRetinaUrl: "/images/marker-icon-2x.png",
//         shadowUrl: "/images/marker-shadow.png",
//       });
//     }
//   }, []);

//   return (
//     <MapContainer
//       center={center}
//       zoom={zoom}
//       style={{ height: "100%", width: "100%", zIndex: 0 }}
//       ref={mapRef}
//     >
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       {children}
//     </MapContainer>
//   );
// }