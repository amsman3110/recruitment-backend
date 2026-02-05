import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { clearAuth } from '../services/auth';

export function useLogout() {
  const router = useRouter();

  async function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Logging out...');
              await clearAuth();
              console.log('✅ Logout successful');
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  }

  return { handleLogout };
}