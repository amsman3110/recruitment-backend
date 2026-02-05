import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Login type selector - FIRST SCREEN */}
        <Stack.Screen 
          name="login-type"
          options={{ headerShown: false }}
        />
        
        {/* Candidate auth */}
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="register"
          options={{ headerShown: false }}
        />
        
        {/* Recruiter auth */}
        <Stack.Screen
          name="recruiter-login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="recruiter-register"
          options={{ headerShown: false }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2A",
  },
});