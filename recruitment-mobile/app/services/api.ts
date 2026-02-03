import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://recruitment-backend-cm12.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   ATTACH TOKEN
================================ */
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===============================
   HELPERS
================================ */
export async function apiGet(url: string) {
  try {
    const res = await api.get(url);
    return res.data;
  } catch (error: any) {
    console.error(
      "API GET ERROR:",
      error?.response?.data || error.message
    );
    throw error;
  }
}

export async function apiPost(url: string, data: any) {
  try {
    const res = await api.post(url, data);
    return res.data;
  } catch (error: any) {
    console.error(
      "API POST ERROR:",
      error?.response?.data || error.message
    );
    throw error;
  }
}
