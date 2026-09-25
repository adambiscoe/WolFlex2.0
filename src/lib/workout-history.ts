import { supabase } from "@/lib/supabase";
import type { WorkoutExercise } from "@/providers/workout-provider";

export async function saveWorkout(
  startedAt: number,
  elapsedSeconds: number,
  workoutExercises: WorkoutExercise[],
): Promise<{ error: string | null }> {
  const exercisesPayload = workoutExercises.map(({ exercise, sets }) => ({
    exercise_id: exercise.id,
    sets: sets.map((set) => ({
      weight: set.weight ? Number(set.weight) : null,
      reps: set.reps ? Number(set.reps) : null,
      completed: set.completed,
    })),
  }));

  const { error } = await supabase.rpc("save_workout", {
    p_started_at: new Date(startedAt).toISOString(),
    p_duration_seconds: elapsedSeconds,
    p_exercises: exercisesPayload,
  });

  return { error: error?.message ?? null };
}
