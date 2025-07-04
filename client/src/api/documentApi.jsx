import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const uploadDocument = (formData) => API.post("/docs/upload", formData);
export const fetchDocuments = () => API.get("/docs/mine");
