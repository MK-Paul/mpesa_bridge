import api from './api';

export interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    status?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async register(firstName: string, lastName: string, email: string, password: string): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/register', {
            name: `${firstName} ${lastName}`,
            email,
            password
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};
