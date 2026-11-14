import axios from "axios";

export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || window.location.origin
).replace(/\/+$/, "");

axios.defaults.baseURL = API_BASE_URL;

// Automatically attach JWT token to every outgoing request if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
