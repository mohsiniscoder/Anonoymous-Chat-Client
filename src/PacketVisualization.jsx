import React, { useEffect, useState } from 'react';
import './PacketVisualization.css'; // Import CSS for styling and animations

const PacketVisualization = () => {
  const [currentLayer, setCurrentLayer] = useState(0);
  const layers = [
    'Application Layer (HTTP)',
    'Presentation Layer',
    'Session Layer',
    'Transport Layer (TCP/UDP)',
    'Network Layer (IP)',
    'Data Link Layer (Frame)',
    'Physical Layer'
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentLayer((prevLayer) => (prevLayer + 1) % layers.length);
    }, 1000); // Change layer every second

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="packet-visualization">
      <h3>Packet Transfer Through OSI Layers</h3>
      <div className="osi-layers">
        {layers.map((layer, index) => (
          <div
            key={index}
            className={`osi-layer ${currentLayer === index ? 'active' : ''}`}
          >
            {layer}
          </div>
        ))}
      </div>
      <div className="packet">
        <div className={`packet-animation ${layers[currentLayer]}`}>
          Packet Data
        </div>
      </div>
    </div>
  );
};

export default PacketVisualization;