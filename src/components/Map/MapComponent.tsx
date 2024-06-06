import React, { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { MarkerType } from '../../types/Marker';
import styles from '../Map/MapComponent.module.scss';

const containerStyle = {
  width: '600px', 
  height: '400px' 
};

const center = {
  lat: -3.745,
  lng: -38.523
};


interface StateType {
  markers: MarkerType[];
}

const MapComponent: React.FC = () => {
  const [state, setState] = useState<StateType>({ markers: [] });

  const handleMapClick = useCallback((event: any) => {
    const newMarker: MarkerType = {
      id: state.markers.length + 1,
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setState((current) => ({
      markers: [...current.markers, newMarker],
    }));
  }, [state.markers]);

  const handleDeleteMarker = useCallback((id: number) => {
    setState((current) => {
      const updatedMarkers = current.markers
        .filter(marker => marker.id !== id)
        .map((marker, index) => ({
          ...marker,
          id: index + 1
        }));
      return { markers: updatedMarkers };
    });
  }, []);

  const handleDeleteAllMarkers = useCallback(() => {
    setState({ markers: [] });
  }, []);

  const handleMarkerDragEnd = useCallback((event: any, id: number) => {
    const updatedMarkers = state.markers.map(marker => {
      if (marker.id === id) {
        return {
          ...marker,
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
      }
      return marker;
    });
    setState({ markers: updatedMarkers });
  }, [state.markers]);

  return (
    <div  className={styles.map_component}>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onClick={handleMapClick}
        >
          {state.markers.map((marker) => (
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
        <button onClick={handleDeleteAllMarkers} disabled={state.markers.length === 0}>
          Delete All Markers
        </button>
        <ul>
          {state.markers.map((marker) => (
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

