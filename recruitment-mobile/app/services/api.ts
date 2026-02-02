import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * IMPORTANT:
 * - This IP must be your COMPUTER IP
 * - Phone and computer must be on the same Wi-Fi
 * - Backend must be running on port 3000
 */
const BASE_URL = "http://192.168.1.100:3000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach JWT token automatically if it exists
 */
api.interceptors.request.use(
  async (config) => {
    // ✅ FIX: use the SAME key used in tokenStorage.ts
    const token = await AsyncStorage.getItem("auth_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * GET request
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await api.get<T>(url);
  return response.data;
}

/**
 * POST request
 */
export async function apiPost<T>(url: string, data?: any): Promise<T> {
  const response = await api.post<T>(url, data);
  return response.data;
}

export default api;
