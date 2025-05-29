// 'use client';

// import { useEffect, useRef } from 'react';

// type AgentMapProps = {
//   destination: { lat: number; lng: number };
// };

// export default function AgentMap({ destination }: AgentMapProps) {
//   const mapRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const initMap = async () => {
//       try {
//         const { Loader } = await import('@googlemaps/js-api-loader');

//         const loader = new Loader({
//           apiKey: 'AIzaSyDbuaakTmMco9NMMGFMXSOPY1m4bbHIP6Y',
//           version: 'weekly',
//           libraries: ['places'],
//         });

//         await loader.load();

//         if (!mapRef.current) return;

//         const map = new window.google.maps.Map(mapRef.current, {
//           zoom: 14,
//           center: destination,
//         });

//         // Add marker at the destination
//         new window.google.maps.Marker({
//           position: destination,
//           map,
//           title: 'Parcel Destination',
//         });

//         const directionsService = new window.google.maps.DirectionsService();
//         const directionsRenderer = new window.google.maps.DirectionsRenderer({
//           suppressMarkers: true,
//         });

//         directionsRenderer.setMap(map);

//         if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(
//             (position) => {
//               const origin = {
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude,
//               };

//               directionsService.route(
//                 {
//                   origin,
//                   destination,
//                   travelMode: window.google.maps.TravelMode.DRIVING,
//                 },
//                 (result: any, status: any) => {
//                   if (status === window.google.maps.DirectionsStatus.OK) {
//                     directionsRenderer.setDirections(result);
//                   } else {
//                     console.error('Route failed:', status);
//                   }
//                 }
//               );
//             },
//             (error) => {
//               console.error('Geolocation error:', error);
//               // Fallback: just center the map on destination
//               map.setCenter(destination);
//             }
//           );
//         } else {
//           console.warn('Geolocation not supported.');
//           map.setCenter(destination);
//         }
//       } catch (err) {
//         console.error('Map load error:', err);
//       }
//     };

//     initMap();
//   }, [destination]);

//   return (
//     <div
//       ref={mapRef}
//       className="w-full h-[500px] rounded-xl border shadow"
//     />
//   );
// }
