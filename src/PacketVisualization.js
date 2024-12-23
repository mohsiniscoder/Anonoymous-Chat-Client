import React, { useEffect, useState } from 'react';

const PacketVisualization = ({ packetData }) => {
    const [currentPacket, setCurrentPacket] = useState(null);

    useEffect(() => {
        if (packetData.length > 0) {
            const newPacket = packetData[packetData.length - 1];
            setCurrentPacket(newPacket);
        }
    }, [packetData]);

    const renderLayer = (layerData, layerName) => {
        return layerData ? (
            <div>
                <h4>{layerName}</h4>
                <pre>{JSON.stringify(layerData, null, 2)}</pre>
            </div>
        ) : (
            <div>{layerName}: N/A</div>
        );
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Real-Time Packet Data</h3>
            {currentPacket ? (
                <div style={{ padding: '10px', border: '1px solid #ccc' }}>
                    <h4>Packet #{packetData.length}</h4>
                    <div>
                        <strong>Packet Timestamp:</strong>{' '}
                        {currentPacket._source?.layers?.frame?.['frame.time'] || 'N/A'}
                    </div>

                    {/* Displaying different layers of the packet */}
                    {renderLayer(
                        currentPacket._source?.layers?.http,
                        'Application Layer (HTTP)'
                    )}
                    {renderLayer(
                        currentPacket._source?.layers?.ip,
                        'Network Layer (IP)'
                    )}
                    {renderLayer(
                        currentPacket._source?.layers?.tcp,
                        'Transport Layer (TCP)'
                    )}
                    {renderLayer(
                        currentPacket._source?.layers?.frame,
                        'Data Link Layer (Frame)'
                    )}

                    <div>
                        <strong>Physical Layer (Packet Size):</strong>{' '}
                        {`${currentPacket._source?.layers?.frame?.['frame.len']} bytes`}
                    </div>
                </div>
            ) : (
                <p>No packets captured yet...</p>
            )}
        </div>
    );
};

export default PacketVisualization;
