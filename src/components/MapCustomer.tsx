// // MapComponent.tsx
// import { useEffect, useRef, useState } from "react";
// import { Loader } from "@googlemaps/js-api-loader";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Info } from "lucide-react";
// import { Label } from "@/components/ui/label";

// interface MapComponentProps {
//   initialCenter: { lat: number; lng: number };
//   onLocationSelect: (coordinates: { lat: number; lng: number }) => void;
//   selectedCoordinates?: { lat: number; lng: number };
// }

// export function MapComponent({ 
//   initialCenter, 
//   onLocationSelect, 
//   selectedCoordinates 
// }: MapComponentProps) {
//   const mapRef = useRef<HTMLDivElement>(null);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [, setMarker] = useState<google.maps.Marker | null>(null);

//   useEffect(() => {
//     if (!mapRef.current) return;

//     const loader = new Loader({
//       apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//       version: "weekly",
//       libraries: ["places"],
//     });

//     let mapInstance: google.maps.Map;
//     let markerInstance: google.maps.Marker | null = null;

//     loader.load().then(() => {
//       mapInstance = new google.maps.Map(mapRef.current!, {
//         center: initialCenter,
//         zoom: 13,
//         mapTypeControl: false,
//         streetViewControl: false,
//       });

//       // Add click event listener
//       mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
//         if (!e.latLng) return;

//         const lat = e.latLng.lat();
//         const lng = e.latLng.lng();

//         onLocationSelect({ lat, lng });

//         if (markerInstance) {
//           markerInstance.setPosition(e.latLng);
//         } else {
//           markerInstance = new google.maps.Marker({
//             position: e.latLng,
//             map: mapInstance,
//             title: "Selected Location",
//           });
//           setMarker(markerInstance);
//         }
//       });

//       // Set initial marker if coordinates provided
//       if (selectedCoordinates && selectedCoordinates.lat !== 0) {
//         markerInstance = new google.maps.Marker({
//           position: selectedCoordinates,
//           map: mapInstance,
//           title: "Selected Location",
//         });
//         setMarker(markerInstance);
//       }

//       setMap(mapInstance);
//     });

//     return () => {
//       if (markerInstance) {
//         markerInstance.setMap(null);
//       }
//       if (mapInstance) {
//         google.maps.event.clearInstanceListeners(mapInstance);
//       }
//     };
//   }, [initialCenter]); // Add initialCenter as dependency

//   // Update map center when initialCenter changes
//   useEffect(() => {
//     if (map && initialCenter) {
//       map.setCenter(initialCenter);
//     }
//   }, [map, initialCenter]);

//   return (
//     <div className="mb-4">
//       <Label className="text-gray-700 font-medium block mb-2">
//         Select Location
//       </Label>
//       <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
//         <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
//           <span className="font-medium">Map Location</span>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Info className="h-4 w-4 text-gray-500" />
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Click on the map to set the exact location</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//         <div
//           ref={mapRef}
//           className="h-64 w-full"
//           style={{ minHeight: "256px" }}
//         />
//         <div className="p-3 border-t">
//           {selectedCoordinates && selectedCoordinates.lat !== 0 ? (
//             <p className="text-sm text-green-600">
//               Selected: Lat: {selectedCoordinates.lat.toFixed(4)}, Lng:{" "}
//               {selectedCoordinates.lng.toFixed(4)}
//             </p>
//           ) : (
//             <p className="text-sm text-gray-500">
//               Click on the map to select a location
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }