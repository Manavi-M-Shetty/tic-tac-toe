// socket.ts
// ------------------------------------------------------------
// This file creates and returns a Socket.IO client instance
// used to communicate with the backend WebSocket server.
// ------------------------------------------------------------

import { io, Socket } from 'socket.io-client';

export function connectSocket() {

  // Determine the WebSocket server URL.
  // We remove '/api' because sockets connect to the root server,
  // not the API endpoint.
  const url = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

  // Create a Socket.IO client connected to the backend server.
  const socket: Socket = io(url);

  // Return the socket so other components can listen and emit events.
  return socket;
}
