import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import MapComponent from './MapComponent';

const MapWrapper = () => {
  const apiKey = 'AIzaSyDTJjnuqF0J18Uu_Ft2TA5R13WsyyDbo4U';

  if (!apiKey) {
    return (
      <div className="w-full h-[500px] rounded-xl bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Google Maps API key is required</p>
          <p className="text-sm text-gray-500">
            Some Issue occured while loading Google Maps
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={['places']}
    >
      <MapComponent />
    </LoadScript>
  );
};

export default MapWrapper;