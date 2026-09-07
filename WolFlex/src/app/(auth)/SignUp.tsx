import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleContinue = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    } else if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords must match.");
      return;
    }
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { username: trimmedUsername } },
    });

    if (error) {
      // The `users` row is created by a database trigger on auth.users, so a
      // duplicate username surfaces here as a wrapped Postgres error rather

      Alert.alert("Error", "The username you entered is already taken.");

      return;
    }

    router.push("/SignUpInfo");
  };

  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-7 pb-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../../assets/images/WordLogo.png")}
          className="h-44 w-44 self-center"
          resizeMode="contain"
        />
        <Text className="mt-1 text-center font-wolFlex text-[25px] text-black">
          CREATE ACCOUNT
        </Text>
        <Text className="text-center font-wolFlex text-[18px] text-black">
          JOIN WOLFLEX AND START YOUR JOURNEY
        </Text>
        <View className="mt-5 gap-3">
          <TextInput
            className="h-12 mr-3 w-full rounded-lg border border-neutral-200 px-4 text-md text-neutral-900"
            placeholder="Username"
            autoCapitalize="none"
            placeholderTextColor="#8b8b8b"
            onChangeText={(text) => setUsername(text)}
          />
          <TextInput
            className="h-12 w-full rounded-lg border border-neutral-200 px-4 text-md text-neutral-900"
            placeholder="email@domain.com"
            placeholderTextColor="#8b8b8b"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View className="relative justify-center">
            <TextInput
              className="h-12 w-full rounded-lg border border-neutral-200 px-4 pr-10 text-md text-neutral-900"
              placeholder="Password"
              placeholderTextColor="#8b8b8b"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              className="absolute inset-y-0 right-3 items-center justify-center"
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#8b8b8b"
              />
            </TouchableOpacity>
          </View>
          <View className="relative justify-center">
            <TextInput
              className="h-12 w-full rounded-lg border border-neutral-200 px-4 pr-10 text-md text-neutral/99"
              placeholder="Confirm Password"
              placeholderTextColor="#8b8b8b"
              secureTextEntry={!showConfirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              className="absolute inset-y-0 right-3 items-center justify-center"
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              hitSlop={8}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={18}
                color="#8b8b8b"
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="mt-2 text-center text-[11px] leading-4 text-neutral-500">
          By creating an account, you agree to our{" "}
          <Text className="text-black">Terms of Service</Text>
          {"\n"}and{" "}
          <Text className="text-black">Privacy Policy -- Coming soon</Text>
        </Text>

        <TouchableOpacity
          className="mt-3 h-10 w-full items-center justify-center rounded-lg bg-wolf-red"
          onPress={handleContinue}
        >
          <Text className="font-wolFlex text-lg text-white">
            CREATE ACCOUNT
          </Text>
        </TouchableOpacity>

        <View className="mt-8 my-5 w-full flex-row items-center">
          <View className="h-px flex-1 bg-neutral-200" />
          <Text className="mx-3 text-sm text-neutral-500">or</Text>
          <View className="h-px flex-1 bg-neutral-200" />
        </View>

        <TouchableOpacity
          className="mt-4 h-10 w-full items-center justify-center rounded-lg bg-wolf-red"
          onPress={() => router.push("/SignIn")}
        >
          <Text className="font-wolFlex text-lg text-white">
            LOG INTO EXISTING ACCOUNT
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
