// services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEYS = {
  TOKEN: 'token',
  USER_DATA: 'userData',
  USER_TYPE: 'userType', // 'candidate' or 'recruiter'
  EMAIL: 'email',
  REMEMBER_ME: 'rememberMe',
};

export interface UserData {
  id: number;
  email: string;
  name?: string;
  role: 'candidate' | 'recruiter';
}

// Save login credentials and token
export async function saveAuth(
  token: string,
  userData: UserData,
  rememberMe: boolean = true
): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [AUTH_KEYS.TOKEN, token],
      [AUTH_KEYS.USER_DATA, JSON.stringify(userData)],
      [AUTH_KEYS.USER_TYPE, userData.role],
      [AUTH_KEYS.EMAIL, userData.email],
      [AUTH_KEYS.REMEMBER_ME, rememberMe.toString()],
    ]);
  } catch (error) {
    console.error('Error saving auth:', error);
    throw error;
  }
}

// Get stored token
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Get stored user data
export async function getUserData(): Promise<UserData | null> {
  try {
    const userData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Get user type (candidate or recruiter)
export async function getUserType(): Promise<'candidate' | 'recruiter' | null> {
  try {
    const userType = await AsyncStorage.getItem(AUTH_KEYS.USER_TYPE);
    return userType as 'candidate' | 'recruiter' | null;
  } catch (error) {
    console.error('Error getting user type:', error);
    return null;
  }
}

// Check if user should be auto-logged in
export async function shouldAutoLogin(): Promise<boolean> {
  try {
    const [token, rememberMe] = await AsyncStorage.multiGet([
      AUTH_KEYS.TOKEN,
      AUTH_KEYS.REMEMBER_ME,
    ]);
    
    return !!(token[1] && rememberMe[1] === 'true');
  } catch (error) {
    console.error('Error checking auto-login:', error);
    return false;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Clear all auth data (logout)
export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      AUTH_KEYS.TOKEN,
      AUTH_KEYS.USER_DATA,
      AUTH_KEYS.USER_TYPE,
      AUTH_KEYS.EMAIL,
      AUTH_KEYS.REMEMBER_ME,
    ]);
  } catch (error) {
    console.error('Error clearing auth:', error);
    throw error;
  }
}

// Get complete auth state
export async function getAuthState(): Promise<{
  isAuthenticated: boolean;
  token: string | null;
  userData: UserData | null;
  userType: 'candidate' | 'recruiter' | null;
}> {
  try {
    const [token, userData, userType] = await Promise.all([
      getToken(),
      getUserData(),
      getUserType(),
    ]);

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