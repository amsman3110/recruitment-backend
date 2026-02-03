import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://recruitment-backend-cm12.onrender.com";

async function getHeaders() {
  const token = await AsyncStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: await getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}
