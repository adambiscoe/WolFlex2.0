import { useAssets } from "expo-asset";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { WorkoutProvider } from "@/providers/workout-provider";

import "../../global.css";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading: isAuthLoading, isOnboarded } = useAuth();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    "Anton SC Regular": require("../../assets/fonts/AntonSCRegular.ttf"),
  });
  const [assets] = useAssets([require("../../assets/images/WordLogo.png")]);

  // isOnboarded only resolves once a session exists, so don't block readiness
  // on it while signed out.
  const isProfileReady = !session || isOnboarded !== null;
  const isReady = fontsLoaded && !isAuthLoading && !!assets && isProfileReady;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session && isOnboarded === false}>
        <Stack.Screen name="SignUpInfo" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="Settings" options={{ animation: "slide_from_right" }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ animation: "slide_from_left" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <AuthProvider>
        <WorkoutProvider>
          <RootNavigator />
        </WorkoutProvider>
      </AuthProvider>
    </KeyboardProvider>
  );
}
