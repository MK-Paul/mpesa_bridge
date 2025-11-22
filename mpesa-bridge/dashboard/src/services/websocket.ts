import { io, Socket } from 'socket.io-client';

class WebSocketService {
    private socket: Socket | null = null;
    private connectionUrl: string;

    constructor() {
        // Get backend URL from environment, remove /api/v1 suffix for WebSocket
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        this.connectionUrl = apiUrl.replace('/api/v1', '');
    }

    connect(userId?: string) {
        if (this.socket?.connected) {
            console.log('WebSocket already connected');
            return;
        }

        this.socket = io(this.connectionUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected:', this.socket?.id);
            if (userId) {
                this.socket?.emit('join', userId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        this.socket?.off(event, callback);
    }

    emit(event: string, data?: any) {
        this.socket?.emit(event, data);
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const websocketService = new WebSocketService();
