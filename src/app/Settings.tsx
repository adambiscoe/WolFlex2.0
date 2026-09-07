import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/providers/auth-provider";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

type SettingsRow = {
  icon: IoniconsName;
  label: string;
  onPress: () => void;
};

export default function Settings() {
  const router = useRouter();
  const { signOut } = useAuth();

  const showComingSoon = (label: string) => Alert.alert(label, "Coming soon.");

  const rows: SettingsRow[] = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      onPress: () => showComingSoon("Edit Profile"),
    },
    {
      icon: "lock-closed-outline",
      label: "Privacy",
      onPress: () => showComingSoon("Privacy"),
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      onPress: () => showComingSoon("Notifications"),
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      onPress: () => showComingSoon("Help & Support"),
    },
    {
      icon: "information-circle-outline",
      label: "About",
      onPress: () => showComingSoon("About"),
    },
  ];

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1" hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color="#000000" />
        </TouchableOpacity>
        <Text className="ml-2 font-wolFlex text-xl text-black">Settings</Text>
      </View>

      <ScrollView contentContainerClassName="px-4 pt-2">
        {rows.map((row) => (
          <TouchableOpacity
            key={row.label}
            onPress={row.onPress}
            className="flex-row items-center justify-between border-b border-neutral-100 py-4"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name={row.icon} size={22} color="#000000" />
              <Text className="text-base text-black">{row.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8b8b8b" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleSignOut}
          className="mt-8 items-center rounded-lg bg-wolf-red py-3"
        >
          <Text className="font-wolFlex text-md text-white">SIGN OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
