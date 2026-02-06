import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect immediately to candidate login
    router.replace('/(auth)/login');
  }, []);

  return null;
}