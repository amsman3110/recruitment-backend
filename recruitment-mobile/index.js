import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { getAuthState } from './services/auth';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  async function checkAuthAndRedirect() {
    try {
      console.log('🔍 Checking authentication status...');
      const authState = await getAuthState();

      if (authState.isAuthenticated && authState.userType) {
        console.log('✅ User authenticated:', authState.userType);
        
        // User is logged in - redirect to appropriate dashboard
        if (authState.userType === 'recruiter') {
          console.log('→ Redirecting to recruiter dashboard');
          router.replace('/(recruiter-tabs)');
        } else {
          console.log('→ Redirecting to candidate dashboard');
          router.replace('/(candidate-tabs)');
        }
      } else {
        console.log('❌ No authentication found');
        // Not logged in - show role selection
        router.replace('/(auth)/login-type');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // On error, go to role selection
      router.replace('/(auth)/login-type');
    } finally {
      setIsChecking(false);
    }
  }

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});