import axios from "axios";

// You can adjust the baseURL to your backend API endpoint
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor (e.g., for auth tokens)
api.interceptors.request.use(
    (config) => {
        // You can add logic here to include tokens in the header
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        const activeGymId = localStorage.getItem("activeGymId");
        if (activeGymId) {
            config.headers["X-Gym-Id"] = activeGymId;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors (e.g., 401 Unauthorized)
        if (error.response?.status === 401) {
            // Logic for logout or redirect
        }
        return Promise.reject(error);
    },
);

export default api;
