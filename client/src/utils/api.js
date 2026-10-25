import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://fin-jp.vercel.app/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000,
});

// AI requests need much longer timeout — local LLMs can take 60-120s
export const aiApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://fin-jp.vercel.app/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 180000, // 3 minutes
});

export default api;
