// types/googlemaps.d.ts

declare global {
    interface Window {
      google: typeof google;
    }
  
    var google: typeof google;
  }
  
  export {};
  