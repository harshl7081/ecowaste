declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng;
      addListener(eventName: string, handler: Function): MapsEventListener;
      setMap(map: Map | null): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      draggable?: boolean;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface MapMouseEvent {
      latLng?: LatLng;
    }
  }
}

// Extend HTMLDivElement to include Google Maps instance
interface HTMLDivElement {
  __map?: google.maps.Map;
} 