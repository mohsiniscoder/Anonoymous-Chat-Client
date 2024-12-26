import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import PacketVisualization from './PacketVisualization';
import './App.css';

const socket = io('http://localhost:3001');

const App = () => {
    const [packetData, setPacketData] = useState([]);
    const [username, setUsername] = useState('');
    const [isUsernameSet, setIsUsernameSet] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSetUsername = () => {
        if (username.trim()) setIsUsernameSet(true);
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            const chatMessage = { username, message };
            socket.emit('chatMessage', chatMessage);
            setMessage('');
        }
    };

    useEffect(() => {
        // Fetch initial messages from the server
        const fetchMessages = async () => {
            try {
                const response = await fetch('http://localhost:3001/messages');
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        socket.on('chatMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('chatMessage');
        };
    }, []);

    return (
        <div className="app-container">
            {!isUsernameSet ? (
                <div className="username-container">
                    <h2>Enter your username</h2>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="input-field"
                    />
                    <button onClick={handleSetUsername} className="submit-button">
                        Submit
                    </button>
                </div>
            ) : (
                <div className="chat-container">
                    <h2>Welcome, {username}!</h2>
                    <h3>Real-Time Packet Capture Visualization</h3>
                    <PacketVisualization packetData={packetData} />
                    <div className="chat-room">
                        <h3>Chat Room</h3>
                        <div className="messages-container">
                            {messages.map((msg, index) => (
                                <div key={index} className="message">
                                    <strong>{msg.username}:</strong> {msg.message}
                                </div>
                            ))}
                        </div>
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Type a message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="input-field"
                            />
                            <button onClick={handleSendMessage} className="send-button">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
