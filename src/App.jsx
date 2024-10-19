import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

function App() {
  const [userId, setUserId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const connectSocket = () => {
    if (userId && targetId) {
      const newSocket = io("https://job4jobless.in:4400", {
        query: { id: userId },
      });

      newSocket.on("connect", () => {
        setIsConnected(true);
        console.log("Connected to server");
      });

      newSocket.on("message", (data) => {
        console.log("Received message:", data);
        setChat((prevChat) => [...prevChat, data]);
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Disconnected from server");
      });

      setSocket(newSocket);
    }
  };

  const sendMessage = () => {
    if (message && isConnected && socket) {
      const messageData = {
        messageTo: targetId,
        messageFrom: userId,
        message: message,
      };
      socket.emit("message", messageData);
      setChat((prevChat) => [...prevChat, messageData]);
      setMessage("");
    }
  };

  return (
    <div className="App">
      <h1>Simple Chat App</h1>
      <div>
        <input
          type="text"
          placeholder="Your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Target User ID"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        />
        <button onClick={connectSocket} disabled={isConnected}>
          Connect
        </button>
      </div>
      {isConnected && (
        <div>
          <div
            style={{
              height: "300px",
              overflowY: "scroll",
              border: "1px solid #ccc",
              margin: "10px 0",
            }}
          >
            {chat.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.messageFrom === userId ? "right" : "left",
                }}
              >
                <strong>{msg.messageFrom}: </strong>
                {msg.message}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
