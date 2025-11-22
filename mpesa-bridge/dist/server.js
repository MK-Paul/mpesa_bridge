"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const socket_1 = require("./config/socket");
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow all origins for now (dev mode)
        methods: ['GET', 'POST']
    }
});
// Set the io instance for use in other modules
(0, socket_1.setIoInstance)(io);
// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});
// Start Server
server.listen(env_1.config.port, () => {
    console.log(`
  ################################################
  🛡️  Server listening on port: ${env_1.config.port} 🛡️
  ################################################
  `);
});
