import { Stack } from "expo-router";

const DEV_AUTO_LOGIN = true; // 👈 dev-only shortcut

export default function RootLayout() {
  /**
   * NOTE:
   * -----
   * This file previously caused crashes because:
   * - useSegments() was used during initial router bootstrap
   * - Redirect was returned before the Stack mounted
   *
   * We KEEP the same structure and imports,
   * but we NEUTRALIZE the dangerous logic.
   */

  // ⚠️ DO NOT USE segments in root layout during runtime
  // const segments = useSegments();

  // segments example:
  // ["(auth)", "login"]
  // ["(tabs)"]

  // const isInAuthGroup = segments[0] === "(auth)";

  /**
   * ⚠️ IMPORTANT:
   * Root layout must NEVER redirect conditionally.
   * Auth decisions must happen in screens, not layouts.
   *
   * The DEV_AUTO_LOGIN logic is intentionally disabled here
   * to prevent router initialization crashes.
   */

  /*
  if (DEV_AUTO_LOGIN && isInAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }
  */

  return (
    <Stack>
      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
