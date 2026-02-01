import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

/**
 * Save JWT token
 */
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get stored JWT token
 */
export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Remove JWT token (logout)
 */
export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
