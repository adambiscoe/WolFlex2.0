import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { useWorkout } from "@/providers/workout-provider";

export type Exercise = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  muscles: string[];
  image_url: string | null;
};

export function ExerciseListItem({ exercise }: { exercise: Exercise }) {
  const { isActive, hasExercise, addExercise, removeExercise } = useWorkout();
  const added = hasExercise(exercise.id);

  return (
    <View className="flex-row items-center gap-3 rounded-lg border border-neutral-100 p-3">
      {exercise.image_url ? (
        <Image
          source={{ uri: exercise.image_url }}
          className="h-14 w-14 rounded-md bg-neutral-100"
          resizeMode="cover"
        />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-md bg-neutral-100">
          <Text className="text-xs text-neutral-400">No image</Text>
        </View>
      )}

      <View className="flex-1">
        <Text className="text-base font-medium text-black">
          {exercise.name}
        </Text>
        {exercise.category && (
          <Text className="text-xs text-neutral-500">{exercise.category}</Text>
        )}
        {exercise.muscles.length > 0 && (
          <Text className="text-xs text-neutral-400" numberOfLines={1}>
            {exercise.muscles.join(", ")}
          </Text>
        )}
      </View>

      {isActive && (
        <TouchableOpacity
          onPress={() =>
            added ? removeExercise(exercise.id) : addExercise(exercise)
          }
          className={`h-9 w-9 items-center justify-center rounded-full ${
            added ? "bg-wolf-red" : "bg-neutral-100"
          }`}
        >
          <Ionicons
            name={added ? "checkmark" : "add"}
            size={20}
            color={added ? "#ffffff" : "#000000"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
