import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useWorkout, type WorkoutExercise } from "@/providers/workout-provider";

export function WorkoutExerciseCard({
  workoutExercise,
}: {
  workoutExercise: WorkoutExercise;
}) {
  const { removeExercise, removeSet, updateSet, addSet } = useWorkout();
  const { exercise, sets } = workoutExercise;
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleAddSetPress = () => {
    addSet(exercise.id);
  };

  const handleRemoveSet = (setIndex: number) => {
    removeSet(exercise.id, setIndex);
    setIsMenuVisible(false);
  };

  const handleRemoveExercise = () => {
    setIsMenuVisible(false);
    Alert.alert(
      "Remove Exercise",
      `Remove ${exercise.name} and all its sets from this workout?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeExercise(exercise.id),
        },
      ],
    );
  };

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-wolFlex text-2xl text-black">
          {exercise.name}
        </Text>
        <TouchableOpacity
          onPress={() => setIsMenuVisible(true)}
          hitSlop={8}
          className="p-1"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        <Text className="w-10 font-wolFlex text-xs text-black">Set</Text>
        <Text className="flex-1 font-wolFlex text-xs text-black">Previous</Text>
        <Text className="w-12 font-wolFlex text-xs text-black">Weight</Text>
        <Text className="w-12 font-wolFlex text-xs text-black">Reps</Text>
        <Text className="w-14 font-wolFlex text-xs text-black">Completed</Text>
      </View>

      {sets.map((set, index) => (
        <View key={index} className="mt-2 flex-row items-center gap-2">
          <View className="h-9 w-10 items-center justify-center rounded-lg border border-wolf-red">
            <Text className="text-sm text-black">{index + 1}</Text>
          </View>

          <View className="h-9 flex-1 justify-center rounded-lg border border-wolf-red px-2">
            <Text className="text-xs text-neutral-400">--</Text>
          </View>

          <TextInput
            className="h-9 w-12 rounded-lg border border-wolf-red text-center text-sm"
            keyboardType="numeric"
            value={set.weight}
            onChangeText={(text) =>
              updateSet(exercise.id, index, { weight: text })
            }
          />

          <TextInput
            className="h-9 w-12 rounded-lg border border-wolf-red text-center text-sm"
            keyboardType="numeric"
            value={set.reps}
            onChangeText={(text) =>
              updateSet(exercise.id, index, { reps: text })
            }
          />

          <TouchableOpacity
            onPress={() =>
              updateSet(exercise.id, index, { completed: !set.completed })
            }
            className={`h-9 w-14 items-center justify-center rounded-lg border border-wolf-red ${
              set.completed ? "bg-wolf-red" : "bg-white"
            }`}
          >
            {set.completed && (
              <Ionicons name="checkmark" size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      ))}
      <View className="mt-2 w-full items-center">
        <TouchableOpacity
          className="w-full items-center justify-center rounded-lg bg-wolf-red py-2"
          onPress={handleAddSetPress}
        >
          <Text className="font-wolFlex text-sm text-white">ADD SET</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setIsMenuVisible(false)}
        >
          <Pressable className="rounded-t-2xl bg-white p-4" onPress={() => {}}>
            <Text className="font-wolFlex text-lg text-black">
              {exercise.name}
            </Text>

            {sets.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleRemoveSet(index)}
                className="flex-row items-center justify-between border-b border-neutral-100 py-3"
              >
                <Text className="text-base text-black">
                  Remove Set {index + 1}
                </Text>
                <Ionicons name="trash-outline" size={18} color="#bc1823" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleRemoveExercise}
              className="mt-4 items-center rounded-lg bg-wolf-red py-3"
            >
              <Text className="font-wolFlex text-sm text-white">
                REMOVE EXERCISE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsMenuVisible(false)}
              className="mt-2 items-center py-2"
            >
              <Text className="text-sm text-neutral-500">Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
