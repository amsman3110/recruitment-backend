import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getAuthState } from './services/auth';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAutoLogin();
  }, []);

  async function checkAutoLogin() {
    try {
      console.log('🔍 Checking for auto-login...');
      
      // Use the refined auth state logic
      const authState = await getAuthState();
      
      console.log('📦 Auth state:', authState);
      
      // authState.isAuthenticated is only true if a token exists AND rememberMe was true
      if (authState.isAuthenticated && authState.userType) {
        console.log('✅ User is authenticated!');
        console.log('👤 User type:', authState.userType);
        
        // Redirect based on user type
        if (authState.userType === 'candidate') {
          console.log('🎯 Redirecting to candidate dashboard...');
          router.replace('/(tabs)');
        } else if (authState.userType === 'recruiter') {
          console.log('🎯 Redirecting to recruiter dashboard...');
          router.replace('/(recruiter-tabs)');
        } else {
          console.log('❌ Unknown user type, redirecting to login');
          router.replace('/(auth)/login');
        }
      } else {
        console.log('❌ No auth found or Remember Me was false, redirecting to login');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('❌ Error checking auto-login:', error);
      router.replace('/(auth)/login');
    } finally {
      setChecking(false);
    }
  }

  // Show loading spinner while checking
  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return null;
}