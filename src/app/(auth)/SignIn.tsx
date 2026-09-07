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

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  //NEED TO REMOVE FACE AUTH AT SOME POINT< OR MAKE IT WORK
  const handleContinue = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Error", error.message + ".");
    }
  };

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

        <Text className="mt-2 text-center font-wolFlex text-[25px] text-black">
          SIGN IN
        </Text>
        <Text className="mt-2 text-center font-wolFlex text-[18px] text-black">
          ENTER EMAIL OR USERNAME AND PASSWORD HERE
        </Text>

        <View className="mt-6 gap-3">
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
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
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
        </View>

        <Text className="mt-6 text-center text-[11px] leading-4 text-neutral-500">
          By clicking continue, you agree to our{" "}
          <Text className="text-black">Terms of Service</Text>
          {"\n"}and{" "}
          <Text className="text-black">Privacy Policy -- Coming soon</Text>
        </Text>

        <TouchableOpacity
          className="mt-8 h-10 w-full items-center justify-center rounded-lg bg-wolf-red"
          onPress={handleContinue}
        >
          <Text className="font-wolFlex text-lg text-white">CONTINUE</Text>
        </TouchableOpacity>

        <View className="my-7 w-full flex-row items-center">
          <View className="h-px flex-1 bg-neutral-200" />
          <Text className="mx-3 text-sm text-neutral-500">or</Text>
          <View className="h-px flex-1 bg-neutral-200" />
        </View>

        <TouchableOpacity
          className="mt-2 h-10 w-full items-center justify-center rounded-lg bg-wolf-red"
          onPress={() => router.push("/SignUp")}
        >
          <Text className="font-wolFlex text-lg text-white">
            CREATE NEW ACCOUNT
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
