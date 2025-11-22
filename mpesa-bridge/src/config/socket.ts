import { Server } from 'socket.io';

let io: Server;

export const setIoInstance = (ioInstance: Server) => {
    io = ioInstance;
};

export const getIo = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call setIoInstance first.');
    }
    return io;
};
