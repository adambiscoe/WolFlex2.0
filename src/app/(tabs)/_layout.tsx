import { pickAndUploadAvatar } from "@/lib/avatar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { ComponentProps, useEffect, useState } from "react";
import { Alert, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => <TabHeader />,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#000000",
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: 6,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
        },
        tabBarItemStyle: {
          borderRadius: 10,
          marginHorizontal: 6,
          overflow: "hidden",
        },
        tabBarActiveBackgroundColor: "#bc1823",

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IoniconsName = "ellipse-outline";

          switch (route.name) {
            case "HomeTab":
              iconName = focused ? "home" : "home-outline";
              break;
            case "SearchTab":
              iconName = focused ? "search" : "search-outline";
              break;
            case "ExerciseTab":
              iconName = focused ? "barbell" : "barbell-outline";
              break;
            case "DietTab":
              iconName = focused ? "restaurant" : "restaurant-outline";
              break;
            case "SocialTab":
              iconName = focused ? "people" : "people-outline";
              break;
          }

          return <Ionicons name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="HomeTab" options={{ title: "Home" }} />
      <Tabs.Screen name="SearchTab" options={{ title: "SearchTab" }} />
      <Tabs.Screen name="ExerciseTab" options={{ title: "ExerciseTab" }} />
      <Tabs.Screen name="DietTab" options={{ title: "DietTab" }} />
      <Tabs.Screen name="SocialTab" options={{ title: "SocialTab" }} />
    </Tabs>
  );
}

function TabHeader() {
  const { session } = useAuth();
  const router = useRouter();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from("users")
        .select("image")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setAvatarUrl(data.image ?? null);
      }
    };
    fetchAvatar();
  }, [session]);

  const handleChangeAvatar = async () => {
    if (!session || isUploading) return;
    setIsUploading(true);
    const { url, error } = await pickAndUploadAvatar(session.user.id);
    setIsUploading(false);

    if (error) {
      Alert.alert("Error", error);
      return;
    }
    if (url) setAvatarUrl(url);
  };

  return (
    <SafeAreaView className="bg-white" edges={["top", "left", "right"]}>
      <View className="flex-row items-center justify-between px-3 py-3">
        <Image
          source={require("../../../assets/images/WolfAlone.png")}
          className="h-20 w-20"
          resizeMode="contain"
        />

        <View className="flex-row items-center">
          <TouchableOpacity
            className="p-2"
            onPress={() => router.push("/Settings")}
          >
            <Ionicons name="cog" size={55} color="#000000" />
          </TouchableOpacity>
          {avatarUrl ? (
            <TouchableOpacity
              onPress={handleChangeAvatar}
              disabled={isUploading}
              className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-200 disabled:opacity-50"
            >
              <Image
                source={{ uri: avatarUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleChangeAvatar}
              disabled={isUploading}
            >
              <Ionicons name="person-circle" size={65} style={{}} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
