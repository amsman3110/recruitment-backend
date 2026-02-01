import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function apiGet<T>(url: string) {
  const response = await apiClient.get<T>(url);
  return response.data;
}

export async function apiPost<T>(url: string, data: any) {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}
