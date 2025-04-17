import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question } from "@/types";
import { questions as initialQuestions } from "@/data/mockData";

interface QuizState {
  questions: Question[];

  getQuestions: () => Question[];
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: initialQuestions,

      getQuestions: () => get().questions,
    }),
    {
      name: "quiz-data-storage",
      partialize: (state) => ({ questions: state.questions }),
    }
  )
);
