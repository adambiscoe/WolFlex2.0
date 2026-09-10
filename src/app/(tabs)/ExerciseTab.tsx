import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { SlideInUp, SlideOutDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExerciseListItem, type Exercise } from "@/components/Exercise";
import { WorkoutExerciseCard } from "@/components/WorkoutExerciseCard";
import { supabase } from "@/lib/supabase";
import { useWorkout } from "@/providers/workout-provider";

function formatElapsed(totalSeconds: number) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function ExerciseTab() {
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingExercises, setIsAddingExercises] = useState(false);

  const {
    isActive,
    elapsedSeconds,
    workoutExercises,
    startWorkout,
    endWorkout,
  } = useWorkout();

  const cancelWorkout = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure? Your progress on this workout will be lost.",
      [
        { text: "Keep Going", style: "cancel" },
        {
          text: "Cancel Workout",
          style: "destructive",
          onPress: () => endWorkout(),
        },
      ],
    );
  };

  useEffect(() => {
    const trimmed = query.trim();

    // Debounce so a request doesn't fire on every keystroke.
    const timeout = setTimeout(async () => {
      setIsLoading(true);

      let request = supabase
        .from("exercises")
        .select("id, name, description, category, muscles, image_url")
        .order("name")
        .limit(50);

      if (trimmed) {
        request = request.ilike("name", `%${trimmed}%`);
      }

      const { data, error } = await request;
      setIsLoading(false);

      if (error) {
        return;
      }
      setExercises(data ?? []);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const browseList = (
    <>
      <View className="px-4 pt-4">
        <TextInput
          className="h-11 w-full rounded-lg border border-neutral-200 px-4 text-sm text-neutral-900"
          placeholder="Search exercises..."
          placeholderTextColor="#8b8b8b"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isLoading && exercises.length === 0 ? (
        <ActivityIndicator className="mt-8" color="#bc1823" />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="gap-3 px-4 py-4"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text className="mt-8 text-center text-neutral-500">
              {query.trim() ? "No exercises found." : "No exercises available."}
            </Text>
          }
          renderItem={({ item }) => <ExerciseListItem exercise={item} />}
        />
      )}
    </>
  );

  if (!isActive) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={startWorkout}
            className="items-center rounded-lg bg-wolf-red py-3"
          >
            <Text className="font-wolFlex text-md text-white">
              START WORKOUT
            </Text>
          </TouchableOpacity>
        </View>
        {browseList}
      </SafeAreaView>
    );
  }

  if (isAddingExercises) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
        <View className="flex-row items-center justify-between px-4 pt-4">
          <Text className="font-wolFlex text-3xl text-black">
            Add Exercises
          </Text>
          <TouchableOpacity
            onPress={() => setIsAddingExercises(false)}
            hitSlop={8}
          >
            <Text className="font-wolFlex text-2xl text-wolf-red">DONE</Text>
          </TouchableOpacity>
        </View>
        {browseList}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <Animated.View
        entering={SlideInUp}
        exiting={SlideOutDown}
        className="flex-1"
      >
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={() => setIsAddingExercises(true)}
            className="items-center rounded-lg bg-wolf-red py-3"
          >
            <Text className="font-wolFlex text-md text-white">
              ADD EXERCISES
            </Text>
          </TouchableOpacity>
          <View className="mt-4 flex-row items-baseline justify-between">
            <Text className="font-wolFlex text-3xl text-black">
              Current Workout
            </Text>
            <Text className="font-wolFlex text-lg text-wolf-red bg-red-100 px-2 py-1 rounded-lg">
              {formatElapsed(elapsedSeconds)}
            </Text>
          </View>
        </View>

        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={20}
        >
          {workoutExercises.map((workoutExercise) => (
            <WorkoutExerciseCard
              key={workoutExercise.exercise.id}
              workoutExercise={workoutExercise}
            />
          ))}
        </KeyboardAwareScrollView>

        <View className="border-t border-neutral-100 px-4 py-3">
          <TouchableOpacity
            onPress={endWorkout}
            className="items-center rounded-lg bg-wolf-red py-3"
          >
            <Text className="font-wolFlex text-md text-white">
              FINISH WORKOUT
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={cancelWorkout}
            className="mt-2 items-center"
          >
            <Text className="mt-2 text-center font-wolFlex text-sm text-wolf-red">
              {" "}
              Cancel Workout
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
