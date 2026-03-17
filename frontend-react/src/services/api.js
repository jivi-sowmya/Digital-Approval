import axios from "axios";

function resolveApiOrigin() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const { hostname, origin, protocol } = window.location;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";

  if (isLocalHost) {
    return `${protocol}//localhost:5000`;
  }

  return origin;
}

const API = axios.create({
  baseURL: `${resolveApiOrigin()}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken") || "";
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
