import * as SecureStore from 'expo-secure-store';

// We are using very simple keys to avoid any confusion
export async function saveAuth(token, userData, rememberMe) {
  try {
    // 1. Save the token
    await SecureStore.setItemAsync('token', token);
    // 2. Save the user type (candidate or recruiter)
    await SecureStore.setItemAsync('userType', userData.role);
    // 3. Save the "Remember Me" choice as a string
    await SecureStore.setItemAsync('rememberMe', rememberMe ? 'true' : 'false');
    
    console.log("✅ Auth saved! Remember Me is:", rememberMe);
  } catch (error) {
    console.error("❌ Save error:", error);
  }
}

export async function getAuthState() {
  try {
    const token = await SecureStore.getItemAsync('token');
    const userType = await SecureStore.getItemAsync('userType');
    const rememberMe = await SecureStore.getItemAsync('rememberMe');

    // AUTO-LOGIN LOGIC: Only true if token exists AND rememberMe is 'true'
    const isAuthenticated = !!token && rememberMe === 'true';

    return { isAuthenticated, userType };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('userType');
  await SecureStore.deleteItemAsync('rememberMe');
}