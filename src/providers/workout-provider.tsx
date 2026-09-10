import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import type { Exercise } from "@/components/Exercise";

export type WorkoutSet = {
  weight: string;
  reps: string;
  completed: boolean;
};

export type WorkoutExercise = {
  exercise: Exercise;
  sets: WorkoutSet[];
};

function emptySet(): WorkoutSet {
  return { weight: "", reps: "", completed: false };
}

type WorkoutContextValue = {
  isActive: boolean;
  elapsedSeconds: number;
  workoutExercises: WorkoutExercise[];
  startWorkout: () => void;
  endWorkout: () => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (id: number) => void;
  hasExercise: (id: number) => boolean;
  addSet: (exerciseId: number) => void;
  removeSet: (exerciseId: number, setIndex: number) => void;
  updateSet: (
    exerciseId: number,
    setIndex: number,
    patch: Partial<WorkoutSet>,
  ) => void;
};

const WorkoutContext = createContext<WorkoutContextValue | undefined>(
  undefined,
);

export function WorkoutProvider({ children }: PropsWithChildren) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    [],
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (startedAt === null) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const startWorkout = () => {
    setStartedAt(Date.now());
    setWorkoutExercises([]);
  };

  const endWorkout = () => {
    setStartedAt(null);
    setWorkoutExercises([]);
  };

  const addExercise = (exercise: Exercise) => {
    setWorkoutExercises((prev) =>
      prev.some((w) => w.exercise.id === exercise.id)
        ? prev
        : [...prev, { exercise, sets: [emptySet()] }],
    );
  };

  const removeExercise = (id: number) => {
    setWorkoutExercises((prev) => prev.filter((w) => w.exercise.id !== id));
  };

  const hasExercise = (id: number) =>
    workoutExercises.some((w) => w.exercise.id === id);

  const addSet = (exerciseId: number) => {
    setWorkoutExercises((prev) =>
      prev.map((w) =>
        w.exercise.id === exerciseId
          ? { ...w, sets: [...w.sets, emptySet()] }
          : w,
      ),
    );
  };

  const removeSet = (exerciseId: number, setIndex: number) => {
    setWorkoutExercises((prev) =>
      prev.map((w) =>
        w.exercise.id === exerciseId
          ? { ...w, sets: w.sets.filter((_, i) => i !== setIndex) }
          : w,
      ),
    );
  };

  const updateSet = (
    exerciseId: number,
    setIndex: number,
    patch: Partial<WorkoutSet>,
  ) => {
    setWorkoutExercises((prev) =>
      prev.map((w) =>
        w.exercise.id === exerciseId
          ? {
              ...w,
              sets: w.sets.map((s, i) =>
                i === setIndex ? { ...s, ...patch } : s,
              ),
            }
          : w,
      ),
    );
  };

  return (
    <WorkoutContext.Provider
      value={{
        isActive: startedAt !== null,
        elapsedSeconds,
        workoutExercises,
        startWorkout,
        endWorkout,
        addExercise,
        removeExercise,
        hasExercise,
        addSet,
        removeSet,
        updateSet,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
