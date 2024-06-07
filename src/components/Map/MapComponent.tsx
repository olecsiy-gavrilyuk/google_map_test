import React, { useCallback, useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker,  } from "@react-google-maps/api";
import { MarkerType } from "../../types/Marker";
import { database } from "../../services/firebase";
import { ref, set, onValue, remove } from "firebase/database";
import styles from "../Map/MapComponent.module.scss";


const containerStyle = {
  width: "600px",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

interface StateType {
  markers: MarkerType[];
}

const MapComponent: React.FC = () => {
  const [markersState, setSMarkersState] = useState<StateType>({ markers: [] });
  const [nextId, setNextId] = useState<number>(1);

  useEffect(() => {
    const markersRef = ref(database, "markers");
    onValue(markersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const markersArray = Object.keys(data).map((key) => ({
          id: parseInt(key, 10),
          lat: data[key].lat,
          lng: data[key].lng,
        }));
        const maxId = markersArray.length > 0 ? Math.max(...markersArray.map(m => m.id)) : 0;
        setSMarkersState({ markers: markersArray });
        setNextId(maxId + 1);
      }
    });
  }, []);

  const handleMapClick = useCallback(
    (event: any) => {
      const newMarker: MarkerType = {
        id: nextId,
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      const markerRef = ref(database, `markers/${nextId}`);
      set(markerRef, {
        lat: newMarker.lat,
        lng: newMarker.lng,
      });


      setNextId((prevId) => prevId );
    },
    [nextId]
  );
  
  const handleDeleteMarker = useCallback((id: number) => {
    const markerRef = ref(database, `markers/${id}`);
    remove(markerRef);

    setSMarkersState((current) => {
      const updatedMarkers = current.markers.filter((marker) => marker.id !== id);
      return { markers: updatedMarkers };
    });
  }, []);

  const handleDeleteAllMarkers = useCallback(() => {
    set(ref(database, "markers"), null);
    setSMarkersState({ markers: [] });
    setNextId(1);
  }, []);

  const handleMarkerDragEnd = useCallback(
    (event: any, id: number) => {
      const updatedMarkers = markersState.markers.map((marker) => {
        if (marker.id === id) {
          const updatedMarker = {
            ...marker,
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          const markerRef = ref(database, `markers/${id}`);
          set(markerRef, {
            lat: updatedMarker.lat,
            lng: updatedMarker.lng,
          });
          return updatedMarker;
        }
        return marker;
      });
      setSMarkersState({ markers: updatedMarkers });
    },
    [markersState.markers]
  );


  return (
    <div className={styles.map_component}>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onClick={handleMapClick}
        >
          {markersState.markers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              label={`${marker.id}`}
              draggable={true}
              onDragEnd={(event) => handleMarkerDragEnd(event, marker.id)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
      <div className={styles.markers_list}>
        <h2>Markers List</h2>
        <button onClick={handleDeleteAllMarkers} disabled={markersState.markers.length === 0}>
          Delete All Markers
        </button>
        <ul>
          {markersState.markers.map((marker) => (
            <li key={marker.id}>
              Marker {marker.id}: ({marker.lat.toFixed(4)}, {marker.lng.toFixed(4)})
              <button onClick={() => handleDeleteMarker(marker.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapComponent;

