import { Pressable, Text, View } from "react-native";

import { useAuth } from "@/providers/auth-provider";

export default function Index() {
  const { session, signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6">
      <Text>Signed in as {session?.user.email}</Text>
      <Pressable className="rounded-lg bg-black px-4 py-3" onPress={signOut}>
        <Text className="font-medium text-white">Sign out</Text>
      </Pressable>
    </View>
  );
}
