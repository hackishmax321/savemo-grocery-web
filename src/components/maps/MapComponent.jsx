import React from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const MapComponent = () => {
  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
  };

  const center = {
    lat: 6.9271, // Colombo coordinates
    lng: 79.8612
  };

  // SaveMo branch locations
  const branches = [
    {
      id: 1,
      name: 'Wattala Branch',
      position: { lat: 6.9895, lng: 79.8833 },
      address: '123 Galle Road, Wattala, Sri Lanka',
      hours: '7:00 AM - 10:00 PM',
      phone: '+94 11 234 5678'
    },
    {
      id: 2,
      name: 'Colombo 10 Branch',
      position: { lat: 6.9344, lng: 79.8801 },
      address: '456 Maradana Road, Colombo 10, Sri Lanka',
      hours: '6:00 AM - 11:00 PM',
      phone: '+94 11 345 6789'
    },
    {
      id: 3,
      name: 'Dehiwala Branch',
      position: { lat: 6.8567, lng: 79.8633 },
      address: '789 Galle Road, Dehiwala, Sri Lanka',
      hours: '7:00 AM - 10:00 PM',
      phone: '+94 11 456 7890'
    },
    {
      id: 4,
      name: 'Malabe Branch',
      position: { lat: 6.9022, lng: 79.9653 },
      address: '321 Kandy Road, Malabe, Sri Lanka',
      hours: '8:00 AM - 9:00 PM',
      phone: '+94 11 567 8901'
    }
  ];

  const [selectedBranch, setSelectedBranch] = React.useState(null);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={11}
      center={center}
      options={{
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#333333" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      }}
    >
      {branches.map(branch => (
        <Marker
          key={branch.id}
          position={branch.position}
          onClick={() => setSelectedBranch(branch)}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }}
          animation={window.google.maps.Animation.DROP}
        />
      ))}

      {selectedBranch && (
        <InfoWindow
          position={selectedBranch.position}
          onCloseClick={() => setSelectedBranch(null)}
        >
          <div className="p-2 text-gray-800">
            <h3 className="font-bold text-lg text-blue-600 mb-1">{selectedBranch.name}</h3>
            <p className="text-sm mb-1">📍 {selectedBranch.address}</p>
            <p className="text-sm mb-1">🕒 {selectedBranch.hours}</p>
            <p className="text-sm mb-2">📞 {selectedBranch.phone}</p>
            <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors">
              Get Directions
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapComponent;