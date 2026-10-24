import { io, Socket } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket: Socket | null = null;

/**
 * Get (or lazily create) the shared Socket.IO connection, authenticated
 * with the same JWT used for REST calls. Safe to call repeatedly - it
 * reuses the existing connection instead of opening a new one each time.
 * Returns null if there's no token yet (user isn't logged in).
 */
export const getSocket = (): Socket | null => {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  if (!socket) {
    socket = io(API_BASE_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });
  }

  return socket;
};

/**
 * Tear down the socket connection - call this on logout so a stale
 * connection (and its stale auth token) doesn't linger.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
