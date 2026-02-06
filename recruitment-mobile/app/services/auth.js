// services/auth.js - Using Expo SecureStore (works better on real devices)
import * as SecureStore from 'expo-secure-store';

const AUTH_KEYS = {
  TOKEN: 'token',
  USER_DATA: 'userData',
  USER_TYPE: 'userType',
  EMAIL: 'email',
  REMEMBER_ME: 'rememberMe',
};

// Save login credentials and token
export async function saveAuth(token, userData, rememberMe = true) {
  try {
    console.log('💾 Saving auth to SecureStore...');
    await SecureStore.setItemAsync(AUTH_KEYS.TOKEN, token);
    await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, JSON.stringify(userData));
    await SecureStore.setItemAsync(AUTH_KEYS.USER_TYPE, userData.role);
    await SecureStore.setItemAsync(AUTH_KEYS.EMAIL, userData.email);
    await SecureStore.setItemAsync(AUTH_KEYS.REMEMBER_ME, rememberMe.toString());
    console.log('✅ Auth saved to SecureStore successfully!');
  } catch (error) {
    console.error('❌ Error saving auth:', error);
    throw error;
  }
}

// Get stored token
export async function getToken() {
  try {
    return await SecureStore.getItemAsync(AUTH_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Get stored user data
export async function getUserData() {
  try {
    const userData = await SecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Get user type (candidate or recruiter)
export async function getUserType() {
  try {
    return await SecureStore.getItemAsync(AUTH_KEYS.USER_TYPE);
  } catch (error) {
    console.error('Error getting user type:', error);
    return null;
  }
}

// Check if user should be auto-logged in
export async function shouldAutoLogin() {
  try {
    const token = await SecureStore.getItemAsync(AUTH_KEYS.TOKEN);
    const rememberMe = await SecureStore.getItemAsync(AUTH_KEYS.REMEMBER_ME);
    return !!(token && rememberMe === 'true');
  } catch (error) {
    console.error('Error checking auto-login:', error);
    return false;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Clear all auth data (logout)
export async function clearAuth() {
  try {
    await SecureStore.deleteItemAsync(AUTH_KEYS.TOKEN);
    await SecureStore.deleteItemAsync(AUTH_KEYS.USER_DATA);
    await SecureStore.deleteItemAsync(AUTH_KEYS.USER_TYPE);
    await SecureStore.deleteItemAsync(AUTH_KEYS.EMAIL);
    await SecureStore.deleteItemAsync(AUTH_KEYS.REMEMBER_ME);
    console.log('✅ Auth cleared successfully');
  } catch (error) {
    console.error('Error clearing auth:', error);
    throw error;
  }
}

// Get complete auth state
export async function getAuthState() {
  try {
    console.log('🔍 Getting auth state from SecureStore...');
    
    const token = await getToken();
    const userData = await getUserData();
    const userType = await getUserType();

    console.log('📦 Token exists:', !!token);
    console.log('📦 User data:', userData);
    console.log('📦 User type:', userType);

    return {
      isAuthenticated: !!token,
      token,
      userData,
      userType,
    };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return {
      isAuthenticated: false,
      token: null,
      userData: null,
      userType: null,
    };
  }
}