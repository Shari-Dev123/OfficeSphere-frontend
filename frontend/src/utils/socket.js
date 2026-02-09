// frontend/src/utils/socket.js
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

console.log('🔌 Connecting to socket:', SOCKET_URL);

// Create socket connection
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling']
});

// Connection event listeners
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
});

export default socket;