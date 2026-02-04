import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://recruitment-backend-production-7c10.up.railway.app";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
  maxContentLength: 100 * 1024 * 1024,
  maxBodyLength: 100 * 1024 * 1024,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log("🔵 Axios Request:", config.method?.toUpperCase(), config.url);
      if (config.data) {
        const dataStr = JSON.stringify(config.data);
        console.log("🔵 Request body size:", dataStr.length, "bytes");
        console.log("🔵 Request body keys:", Object.keys(config.data));
      }
    } catch (error) {
      console.log("Token error:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("API error:", error.response.status, error.response.data);

      return Promise.reject({
        message:
          error.response.data?.message ||
          "Server error. Please try again.",
        status: error.response.status,
      });
    }

    if (error.request) {
      console.log("Network error:", error.request);
      return Promise.reject({
        message: "Network error. Check your internet connection.",
        status: 0,
      });
    }

    return Promise.reject({
      message: "Unexpected error occurred.",
      status: 0,
    });
  }
);

export async function apiGet(path: string) {
  try {
    const response = await api.get(path);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function apiPost(path: string, body: any) {
  try {
    const response = await api.post(path, body);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}