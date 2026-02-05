import { Stack } from "expo-router";

const DEV_AUTO_LOGIN = false; // Disabled for now

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#1E1E2A",
        },
        headerShown: false,
      }}
    >
      {/* Auth screens */}
      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false }}
      />
      
      {/* Candidate tabs */}
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      
      {/* Recruiter tabs - NEW */}
      <Stack.Screen
        name="(recruiter-tabs)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}