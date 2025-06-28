import axios from 'axios';

// TODO: Replace with your actual backend URL
const API_BASE_URL = 'https://datsanbong-hzgebmfhdfe5hda9.australiaeast-01.azurewebsites.net'; // Assuming the backend runs on this port

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to add the JWT token to every request if it exists
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
