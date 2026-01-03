import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8008/api",
  withCredentials: true,
  timeout: 300000, // 5 minutes for video uploads
});

// Remove Content-Type header for FormData (let browser set it with boundary)
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;