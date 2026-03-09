import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { admin } = useAuth();

  useEffect(() => {
    if (admin) {
      // Get token from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (token) {
        const socketURL = import.meta.env.VITE_API_URL?.replace("/api/", "") || "http://localhost:5000";
        
        const newSocket = io(socketURL, {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
          console.log("Socket connected");
          setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
          console.log("Socket disconnected");
          setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [admin]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
