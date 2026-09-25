import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";

type WorkoutHistoryRow = {
  id: string;
  started_at: string;
  finished_at: string;
  duration_seconds: number;
  workout_exercises: {
    position: number;
    exercises: { id: number; name: string } | null;
  }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
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

export default function WorkoutHistory() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
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
            position,
            exercises ( id, name )
          )
        `,
        )
        .order("finished_at", { ascending: false });
      setIsLoading(false);

      if (error) {
        console.error(error);
        return;
      }
      // Without generated Supabase database types, the query builder can't
      // tell this embed is to-one (via exercise_id's foreign key) rather
      // than to-many, so it infers an array here even though PostgREST
      // returns a single object at runtime for a belongs-to relationship.
      setWorkouts((data as unknown as WorkoutHistoryRow[]) ?? []);
    };

    fetchWorkouts();
  }, []);

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
          Workout History
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#bc1823" />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-4 py-4"
          ListEmptyComponent={
            <Text className="mt-8 text-center text-neutral-500">
              No workouts yet.
            </Text>
          }
          renderItem={({ item }) => {
            const exerciseNames = [...item.workout_exercises]
              .sort((a, b) => a.position - b.position)
              .map((we) => we.exercises?.name)
              .filter((name): name is string => !!name);

            return (
              <TouchableOpacity
                onPress={() => router.push(`/WorkoutDetail/${item.id}`)}
                className="rounded-lg border border-neutral-100 p-3"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-wolFlex text-base text-black">
                    {formatDate(item.finished_at)}
                  </Text>
                  <Text className="text-sm text-wolf-red">
                    {formatDuration(item.duration_seconds)}
                  </Text>
                </View>
                <Text
                  className="mt-1 text-sm text-neutral-500"
                  numberOfLines={2}
                >
                  {exerciseNames.length > 0
                    ? exerciseNames.join(", ")
                    : "No exercises recorded"}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
