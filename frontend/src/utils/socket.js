// // frontend/src/utils/socket.js
// import io from 'socket.io-client';

// const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// console.log('🔌 Connecting to socket:', SOCKET_URL);

// // Create socket connection
// export const socket = io(SOCKET_URL, {
//   autoConnect: true,
//   reconnection: true,
//   reconnectionDelay: 1000,
//   reconnectionAttempts: 5,
//   transports: ['websocket', 'polling']
// });

// // Connection event listeners
// socket.on('connect', () => {
//   console.log('✅ Socket connected:', socket.id);
// });

// socket.on('disconnect', (reason) => {
//   console.log('❌ Socket disconnected:', reason);
// });

// socket.on('connect_error', (error) => {
//   console.error('❌ Socket connection error:', error);
// });

// socket.on('reconnect', (attemptNumber) => {
//   console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
// });

// export default socket;


// Helloo idr Dakooo Idr 
// jab bi is ko Live kiya tu upper wala code hi use karna ha 


// frontend/src/utils/socket.js
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

console.log('🔌 Connecting to socket:', SOCKET_URL);

let socket;

try {
  socket = io(SOCKET_URL, {
    autoConnect: false, // manually connect karo
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: 3,
    transports: ['polling', 'websocket'], // polling pehle try karo
    timeout: 5000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('⚠️ Socket unavailable (Vercel limitation):', error.message);
    socket.disconnect(); // retry band karo
  });

} catch (error) {
  console.warn('⚠️ Socket initialization failed:', error.message);
  // Fake socket object taake app crash na kare
  socket = {
    on: () => {},
    off: () => {},
    emit: () => {},
    connect: () => {},
    disconnect: () => {},
    id: null,
    connected: false,
  };
}

export { socket };
export default socket;