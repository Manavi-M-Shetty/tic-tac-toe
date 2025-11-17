import { io, Socket } from 'socket.io-client';
export function connectSocket() {
  const url = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:4000';
  const socket: Socket = io(url);
  return socket;
}
