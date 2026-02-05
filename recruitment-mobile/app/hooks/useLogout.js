// Example logout button component
// Add this to your profile screens

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
              await clearAuth();
              router.replace('/(auth)/role-selection');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  }

  return { handleLogout };
}

// Usage in profile screen:
/*
import { useLogout } from './hooks/useLogout';

export default function ProfileScreen() {
  const { handleLogout } = useLogout();

  return (
    <View>
      {/* ... other profile content ... *\/}
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
*/