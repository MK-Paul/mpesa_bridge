"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.setIoInstance = void 0;
let io;
const setIoInstance = (ioInstance) => {
    io = ioInstance;
};
exports.setIoInstance = setIoInstance;
const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call setIoInstance first.');
    }
    return io;
};
exports.getIo = getIo;
