import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getAuthState } from './services/auth';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [userState, setUserState] = useState({ isAuthenticated: false, userType: null });
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const state = await getAuthState();
        setUserState(state);
      } catch (e) {
        console.error("Auth Init Error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [segments]); // Re-check when segments change to catch login events

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!userState.isAuthenticated && !inAuthGroup) {
      // 1. Not logged in? Go to login.
      router.replace('/(auth)/login');
    } else if (userState.isAuthenticated && inAuthGroup) {
      // 2. Logged in? Pick the right dashboard.
      if (userState.userType === 'recruiter') {
        console.log("🔀 Redirecting to Recruiter Tabs");
        router.replace('/(recruiter-tabs)');
      } else {
        console.log("🔀 Redirecting to Candidate Tabs");
        router.replace('/(tabs)');
      }
    }
  }, [userState.isAuthenticated, userState.userType, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(recruiter-tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}