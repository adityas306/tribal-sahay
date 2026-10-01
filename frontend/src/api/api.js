import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://tribal-sahay.onrender.com",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ts_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
