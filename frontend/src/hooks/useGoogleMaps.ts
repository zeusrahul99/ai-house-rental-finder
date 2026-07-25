import { useState, useEffect } from 'react';

let isScriptLoading = false;
let isScriptLoaded = false;
const callbacks = new Set<() => void>();

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(isScriptLoaded);

  useEffect(() => {
    if (isScriptLoaded) {
      setLoaded(true);
      return;
    }

    const onScriptLoad = () => {
      const googleNamespace = (window as any).google;
      if (googleNamespace?.maps) {
        isScriptLoaded = true;
        setLoaded(true);
      }
    };

    callbacks.add(onScriptLoad);

    if (!isScriptLoading) {
      isScriptLoading = true;
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
      const scriptId = 'google-maps-script';

      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = apiKey
          ? `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
          : `https://maps.googleapis.com/maps/api/js?libraries=places`;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => {
          callbacks.forEach((cb) => cb());
          callbacks.clear();
        });
        script.addEventListener('error', () => {
          console.error('Failed to load Google Maps script.');
          callbacks.clear();
        });
        document.head.appendChild(script);
      } else {
        // If the script already exists, attempt to initialize from the existing load state.
        const googleNamespace = (window as any).google;
        if (googleNamespace?.maps) {
          callbacks.forEach((cb) => cb());
          callbacks.clear();
        }
      }
    }

    return () => {
      callbacks.delete(onScriptLoad);
    };
  }, []);

  return loaded;
}
