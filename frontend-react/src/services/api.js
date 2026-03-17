import axios from "axios";

const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  (window.location.port === "5000"
    ? window.location.origin
    : `${window.location.protocol}//localhost:5000`);

const API = axios.create({ baseURL: `${API_ORIGIN}/api` });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken") || "";
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
