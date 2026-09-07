import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";

export default function SignUpInfo() {
  const router = useRouter();
  const { session, refreshOnboardingStatus } = useAuth();
  const [birthday, setBirthday] = useState(new Date());
  // iOS renders inline and can stay mounted; Android's picker is a one-shot
  // dialog that must be opened on demand and closed after every interaction.
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(
    Platform.OS === "ios",
  );

  const [user, setUser] = useState({
    realName: "",
    birthday: new Date(),
    phoneNumber: "",
    bio: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!user.realName) {
      Alert.alert("Error", "Real name is required.");
      return;
    }

    if (!session) {
      Alert.alert(
        "Confirm your email first",
        "Check your inbox for the confirmation link, then sign in to finish setting up your profile.",
      );
      return;
    }

    setIsSubmitting(true);
    // The signup trigger already created this row (with the username), so
    // this is always an update against the existing row, never an insert.
    const { error } = await supabase
      .from("users")
      .update({
        realName: user.realName,
        birthday: user.birthday.toISOString().slice(0, 10),
        phoneNumber: user.phoneNumber || null,
        bio: user.bio || null,
        onboarding_complete: true,
      })
      .eq("id", session.user.id);
    setIsSubmitting(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    await refreshOnboardingStatus();
    router.replace("/(tabs)");
  };

  const onBirthdayChange = (_event: unknown, selectedDate: Date) => {
    if (Platform.OS === "android") setShowBirthdayPicker(false);
    setBirthday(selectedDate);
    setUser((prev) => ({ ...prev, birthday: selectedDate }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="items-center p-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={62}
      >
        <Image
          source={require("../../assets/images/WordLogo.png")}
          className="relative top-[30px] mb-5 h-[194px] w-[194px]"
        />
        <Text className="mt-[5px] text-center font-wolFlex text-[25px]">
          Tell us about yourself!
        </Text>
        <Text className="mt-[5px] text-center font-wolFlex text-[16px]">
          What's your full name or nickname?
        </Text>
        <View className="mt-5 w-full flex-row justify-between gap-3">
          <TextInput
            className="h-10 w-full rounded-lg border border-neutral-200 px-4 text-sm text-neutral-900"
            placeholder="Name"
            placeholderTextColor="#8b8b8b"
            onChangeText={(text) =>
              setUser((prev) => ({ ...prev, realName: text }))
            }
          />
        </View>

        <View className="mt-6 ml-8 flex-row items-center justify-between">
          <Text className="font-wolFlex text-[16px]">
            Enter your birthday here:
          </Text>

          {Platform.OS === "android" && (
            <TouchableOpacity
              className="h-10 justify-center rounded-lg border border-neutral-200 px-4"
              onPress={() => setShowBirthdayPicker(true)}
            >
              <Text className="text-sm text-neutral-900">
                {birthday.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}

          {showBirthdayPicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              maximumDate={new Date()}
              accentColor="#bc1823"
              onValueChange={onBirthdayChange}
            />
          )}
        </View>

        <Text className="mt-8 mb-5 text-center font-wolFlex text-[16px]">
          Let us know some things about you. What are your hobbies, interests,
          and goals? This will be shown to every user as your profile&apos;s
          bio.
        </Text>

        <View className="w-full">
          <TextInput
            className="mb-3 h-[120px] w-full rounded-md border border-[#ccc] p-3 text-[#808080]"
            multiline={true}
            scrollEnabled={true}
            placeholder="Bio (optional)"
            onChangeText={(value) =>
              setUser((prev) => ({ ...prev, bio: value }))
            }
          />
        </View>

        <TouchableOpacity
          className="mt-3 h-9 w-full items-center justify-center rounded-lg bg-wolf-red disabled:opacity-50"
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          <Text className="font-wolFlex text-md text-white">
            {isSubmitting ? "SAVING…" : "CONTINUE"}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </SafeAreaView>
  );
}
