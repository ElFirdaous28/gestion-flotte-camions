import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true, // keeps cookies (refresh token) for auth
});

export default api;
