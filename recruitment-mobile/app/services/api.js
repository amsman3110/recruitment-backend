import axios from "axios";
import * as SecureStore from 'expo-secure-store';

// Your Railway Production URL
const BASE_URL = "https://recruitment-backend-production-7c10.up.railway.app";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// This part runs every time the app talks to the backend
api.interceptors.request.use(
  async (config) => {
    try {
      // MATCHED: This now uses 'token' to match your auth.js file
      const token = await SecureStore.getItemAsync('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log("🔵 API Request:", config.method?.toUpperCase(), config.url);
    } catch (error) {
      console.log("Token storage error:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("❌ API error:", error.response.status, error.response.data);
      return Promise.reject({
        message: error.response.data?.message || "Server error. Please try again.",
        status: error.response.status,
      });
    }
    return Promise.reject({
      message: "Network error. Check your internet connection.",
      status: 0,
    });
  }
);

// Helper functions for the rest of the app to use
export async function apiGet(path) {
  const response = await api.get(path);
  return response.data;
}

export async function apiPost(path, body) {
  const response = await api.post(path, body);
  return response.data;
}

export async function apiPut(path, body) {
  const response = await api.put(path, body);
  return response.data;
}