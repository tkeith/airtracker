import { useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { GOOGLE_MAPS_API_KEY } from "@/lib/consts";

interface MapComponentProps {
  points: { lat: number; lng: number }[];
}

export default function MapComponent({ points }: MapComponentProps) {
  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    loader.load().then(() => {
      const map = new google.maps.Map(document.getElementById("map")!, {
        center: points.length > 0 ? points[0] : { lat: 0, lng: 0 },
        zoom: 15,
      });

      points.forEach((point) => {
        new google.maps.Marker({
          position: point,
          map,
        });
      });

      const line = new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      line.setMap(map);
    });
  }, [points]);

  return <div id="map" style={{ width: "100%", height: "400px" }} />;
}
