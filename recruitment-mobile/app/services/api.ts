import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "https://recruitment-backend-production-581f.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach JWT token automatically if it exists
 */
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * GET request
 */
export async function apiGet<T>(url: string) {
  const response = await api.get<T>(url);
  return response.data;
}

/**
 * POST request
 */
export async function apiPost<T>(url: string, data?: any) {
  const response = await api.post<T>(url, data);
  return response.data;
}

export default api;
