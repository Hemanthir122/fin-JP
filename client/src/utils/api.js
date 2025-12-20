import axios from 'axios';

const api = axios.create({
    baseURL: 'https://jp-delta.vercel.app/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
