// food-ordering-platform/vendor-app/vendor-app-work-branch/context/socketContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './authContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Get the URL from Environment Variables
    const rawUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
    
    // 2. CLEAN THE URL (ROBUST METHOD)
    // Uses the URL object to safely extract protocol, hostname, and port
    // ignoring any path suffixes like '/api'
    let socketUrl = rawUrl;
    try {
        const urlObj = new URL(rawUrl);
        socketUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}`;
    } catch (e) {
        console.error("❌ Invalid Socket URL in env:", rawUrl);
    }

    console.log("🔌 Connecting Socket to:", socketUrl);

    // 3. Initialize Socket
    // REMOVED: transports: ['websocket'] to allow fallback to polling (better for mobile networks)
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    setSocket(newSocket);

    // 4. Join the "Restaurant Room" if user is logged in
    if (user?.restaurant?.id) {
      // Small delay to ensure connection is ready before emitting
      newSocket.on("connect", () => {
          const roomName = `restaurant_${user.restaurant?.id}`;
          newSocket.emit("join_room", roomName);
          console.log("🟢 Joining Socket Room:", roomName);
      });
    }

    // 5. Cleanup on Unmount
    return () => {
      console.log("🔴 Disconnecting Socket");
      newSocket.disconnect();
    };
  }, [user]); // Re-run if user changes (e.g. login/logout)

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);