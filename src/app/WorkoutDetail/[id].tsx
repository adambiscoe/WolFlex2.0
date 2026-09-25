import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";

type WorkoutSetRow = {
  set_index: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
};

type WorkoutExerciseRow = {
  id: string;
  position: number;
  exercises: { id: number; name: string } | null;
  workout_sets: WorkoutSetRow[];
};

type WorkoutDetailData = {
  id: string;
  started_at: string;
  finished_at: string;
  duration_seconds: number;
  workout_exercises: WorkoutExerciseRow[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds}s` : `${seconds}s`;
}

export default function WorkoutDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<WorkoutDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("workouts")
        .select(
          `
          id,
          started_at,
          finished_at,
          duration_seconds,
          workout_exercises (
            id,
            position,
            exercises ( id, name ),
            workout_sets ( set_index, weight, reps, completed )
          )
        `,
        )
        .eq("id", id)
        .single();
      setIsLoading(false);

      if (error) {
        console.error(error);
        return;
      }
      setWorkout(data as unknown as WorkoutDetailData);
    };

    fetchWorkout();
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-1"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color="#000000" />
        </TouchableOpacity>
        <Text className="ml-2 font-wolFlex text-xl text-black">
          Workout Details
        </Text>
      </View>

      {isLoading || !workout ? (
        <ActivityIndicator className="mt-8" color="#bc1823" />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-wolFlex text-lg text-black">
            {formatDate(workout.finished_at)}
          </Text>
          <Text className="mt-1 text-sm text-wolf-red">
            {formatDuration(workout.duration_seconds)}
          </Text>

          {[...workout.workout_exercises]
            .sort((a, b) => a.position - b.position)
            .map((workoutExercise) => (
              <View key={workoutExercise.id} className="mt-6">
                <Text className="font-wolFlex text-2xl text-black">
                  {workoutExercise.exercises?.name ?? "Unknown exercise"}
                </Text>

                <View className="mt-2 flex-row items-center gap-2">
                  <Text className="w-10 font-wolFlex text-xs text-black">
                    Set
                  </Text>
                  <Text className="w-12 font-wolFlex text-xs text-black">
                    Weight
                  </Text>
                  <Text className="w-12 font-wolFlex text-xs text-black">
                    Reps
                  </Text>
                  <Text className="w-14 font-wolFlex text-xs text-black">
                    Completed
                  </Text>
                </View>

                {[...workoutExercise.workout_sets]
                  .sort((a, b) => a.set_index - b.set_index)
                  .map((set) => (
                    <View
                      key={set.set_index}
                      className="mt-2 flex-row items-center gap-2"
                    >
                      <View className="h-9 w-10 items-center justify-center rounded-lg border border-wolf-red">
                        <Text className="text-sm text-black">
                          {set.set_index + 1}
                        </Text>
                      </View>

                      <View className="h-9 w-12 items-center justify-center rounded-lg border border-wolf-red">
                        <Text className="text-sm text-black">
                          {set.weight ?? "--"}
                        </Text>
                      </View>

                      <View className="h-9 w-12 items-center justify-center rounded-lg border border-wolf-red">
                        <Text className="text-sm text-black">
                          {set.reps ?? "--"}
                        </Text>
                      </View>

                      <View
                        className={`h-9 w-14 items-center justify-center rounded-lg border border-wolf-red ${
                          set.completed ? "bg-wolf-red" : "bg-white"
                        }`}
                      >
                        {set.completed && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#ffffff"
                          />
                        )}
                      </View>
                    </View>
                  ))}
              </View>
            ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
