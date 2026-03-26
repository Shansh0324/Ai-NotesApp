import axios from "axios";

// Step 2: Axios Setup
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Interceptor to attach token to requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Step 3: API Functions
export const loginUser = (data) => API.post("/auth/login", data);
export const signupUser = (data) => API.post("/auth/signup", data);
export const getMe = () => API.get("/auth/me");
export const verifyOTPAuth = (data) => API.post("/auth/verify-otp", data);

export const getProfile = () => API.get("/user/profile");
export const updateProfile = (data) => API.put("/user/profile", data, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const sendOTP = () => API.post("/user/send-otp");
export const verifyOTPProfile = (data) => API.post("/user/verify-otp", data);

export const getNotes = () => API.get("/notes");
export const createNote = (data) => API.post("/notes", data);
export const updateNote = (id, data) => API.put(`/notes/${id}`, data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);

export const uploadPDF = (formData) => API.post("/ai/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const chatWithAI = (data) => API.post("/ai/chat", data);
export const getDocuments = () => API.get("/ai");
export const deleteDocument = (id) => API.delete(`/ai/${id}`);

export default API;
