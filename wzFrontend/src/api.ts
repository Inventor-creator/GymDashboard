import axios from "axios";

// In production, the backend serves the frontend, so use relative URLs
// In development, use the VITE_API_URL env var or default to localhost
const baseURL =
    import.meta.env.MODE === "production"
        ? ""
        : import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL,
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
