import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ?? "https://b-mtrack-service.onrender.com/api";

/** Client public — aucun token, aucun interceptor d'auth */
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

export default api;
