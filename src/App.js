import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import PacketVisualization from './PacketVisualization';

// Connect to the server
const socket = io('http://localhost:3001');

const App = () => {
    const [packetData, setPacketData] = useState([]);
    const [username, setUsername] = useState('');
    const [isUsernameSet, setIsUsernameSet] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSetUsername = () => {
        if (username.trim()) {
            setIsUsernameSet(true);
        }
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            socket.emit('chatMessage', { username, message });
            setMessage('');
        }
    };

    useEffect(() => {
        // Listen for packet data from the server
        socket.on('packetData', (packet) => {
            setPacketData((prevData) => [...prevData, packet]); // Append new packet data
        });

        // Listen for chat messages
        socket.on('chatMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('packetData'); // Clean up the listener on unmount
            socket.off('chatMessage');
        };
    }, []);

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            {!isUsernameSet ? (
                <div>
                    <h2>Enter your username</h2>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '10px', marginBottom: '10px' }}
                    />
                    <button onClick={handleSetUsername} style={{ padding: '10px' }}>
                        Submit
                    </button>
                </div>
            ) : (
                <div>
                    <h2>Welcome, {username}!</h2>
                    <h3>Real-Time Packet Capture Visualization</h3>
                    <PacketVisualization packetData={packetData} />
                    
                    <div style={{ marginTop: '30px' }}>
                        <h3>Chat Room</h3>
                        <div
                            style={{
                                border: '1px solid #ccc',
                                padding: '10px',
                                height: '300px',
                                overflowY: 'scroll',
                                marginBottom: '10px',
                            }}
                        >
                            {messages.map((msg, index) => (
                                <div key={index}>
                                    <strong>{msg.username}:</strong> {msg.message}
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Type a message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ padding: '10px', marginRight: '10px' }}
                        />
                        <button onClick={handleSendMessage} style={{ padding: '10px' }}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
