import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://fin-jp.vercel.app/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000,
});

export default api;

