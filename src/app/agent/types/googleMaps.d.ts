// types/googlemaps.d.ts

declare global {
    interface Window {
      google: typeof google;
    }
  
    // eslint-disable-next-line no-var
    var google: typeof google;
  }
  
  export {};
  