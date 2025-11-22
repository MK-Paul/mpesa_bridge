import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './config/env';
import { setIoInstance } from './config/socket';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for now (dev mode)
        methods: ['GET', 'POST']
    }
});

// Set the io instance for use in other modules
setIoInstance(io);

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Start Server
server.listen(config.port, () => {
    console.log(`
  ################################################
  🛡️  Server listening on port: ${config.port} 🛡️
  ################################################
  `);
});
