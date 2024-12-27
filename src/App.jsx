import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";
import PacketVisualization from './PacketVisualization';

const socket = io("http://localhost:3001");

const App = () => {
  const [rooms, setRooms] = useState([]);
  const [packetData, setPacketData] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [roomKey, setRoomKey] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [newRoomKey, setNewRoomKey] = useState("");
  const [showPacketVisualization, setShowPacketVisualization] = useState(false); // State to track visibility

  const handleSetUsername = () => {
    if (username.trim()) setIsUsernameSet(true);
  };

  const handleCreateRoom = async () => {
    if (newRoom.trim() && newRoomKey.trim()) {
      try {
        const response = await fetch("http://localhost:3001/createRoom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newRoom, key: newRoomKey }),
        });
        const room = await response.json();
        setRooms((prevRooms) => [...prevRooms, room]);
        setNewRoom("");
        setNewRoomKey("");
      } catch (error) {
        console.error("Error creating room:", error);
      }
    }
  };

  const handleJoinRoom = async () => {
    if (!roomKey.trim()) {
      alert("Room key cannot be empty.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: roomKey }),
      });
      const room = await response.json();

      if (room) {
        joinRoom(room.name); // Update the logic to reuse join functionality
      } else {
        alert("Invalid room key.");
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const joinRoom = (roomName) => {
    setCurrentRoom(roomName);
    socket.emit("joinRoom", roomName);
    fetchMessages(roomName);
  };

  const fetchMessages = async (roomName) => {
    try {
      const response = await fetch("http://localhost:3001/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomName, key: roomKey }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        alert("Failed to fetch messages. Invalid room or key.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && currentRoom) {
      const chatMessage = { username, message, room: currentRoom };
      socket.emit("chatMessage", chatMessage);
      setMessage("");

      // Show PacketVisualization component for 30 seconds
      setShowPacketVisualization(true);
      setTimeout(() => {
        setShowPacketVisualization(false);
      }, 30000); // Hide after 30 seconds
    }
  };

  useEffect(() => {
    socket.on("chatMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("chatMessage");
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
            onChange={(e) => setUsername(e.target.value)} // Update state
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSetUsername(); // Trigger set username on Enter
            }}
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
          <div className="room-management">
            <h3>Create a Room</h3>
            <input
              type="text"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)} // Update state
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateRoom(); // Trigger create on Enter
              }}
              placeholder="Room Name"
              className="input-field"
            />
            <input
              type="text"
              value={newRoomKey}
              onChange={(e) => setNewRoomKey(e.target.value)} // Update state
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateRoom(); // Trigger create on Enter
              }}
              placeholder="Room Key"
              className="input-field"
            />
            <button onClick={handleCreateRoom} className="create-room-button">
              Create Room
            </button>

            <h3>Join a Room</h3>
            <input
              type="text"
              value={roomKey}
              onChange={(e) => setRoomKey(e.target.value)} // Update state
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoinRoom(); // Trigger join on Enter
              }}
              placeholder="Enter Room Key"
              className="input-field"
            />

            <button onClick={handleJoinRoom} className="join-room-button">
              Join Room
            </button>
          </div>
          {currentRoom && (
            <>
              <h3>Room: {currentRoom}</h3>
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
                  onChange={(e) => setMessage(e.target.value)} // Update state
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage(); // Trigger send message on Enter
                  }}
                  className="input-field"
                />

                <button onClick={handleSendMessage} className="send-button">
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showPacketVisualization && <PacketVisualization packetData={packetData} />}
    </div>
  );
};

export default App;
