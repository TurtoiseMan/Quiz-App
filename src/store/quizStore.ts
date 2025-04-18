import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question } from "@/types";
import { questions as initialQuestions } from "@/data/mockData";

interface QuizState {
  questions: Question[];

  getQuestions: () => Question[];
  addQuestion: (text: string, createdBy: string) => Question;
  updateQuestion: (id: string, text: string) => Question | null;
  deleteQuestion: (id: string) => boolean;
  initializeStore: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: initialQuestions,

      getQuestions: () => get().questions,

      addQuestion: (text: string, createdBy: string) => {
        const newQuestion: Question = {
          id: Date.now().toString(),
          text,
          createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          questions: [...state.questions, newQuestion],
        }));

        return newQuestion;
      },

      updateQuestion: (id: string, text: string) => {
        let updatedQuestion: Question | null = null;

        set((state) => {
          const questions = [...state.questions];
          const index = questions.findIndex((q) => q.id === id);

          if (index === -1) return state;

          updatedQuestion = {
            ...questions[index],
            text,
            updatedAt: new Date().toISOString(),
          };

          questions[index] = updatedQuestion!;
          return { questions };
        });

        return updatedQuestion;
      },

      deleteQuestion: (id: string) => {
        let success = false;

        set((state) => {
          const questions = state.questions.filter((q) => q.id !== id);

          if (questions.length === state.questions.length) {
            return state;
          }

          success = true;
          return { questions };
        });

        return success;
      },

      initializeStore: () => {
        set((state) => ({ ...state }));
      },
    }),
    {
      name: "quiz-data-storage",
      partialize: (state) => ({ questions: state.questions }),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.questions || state.questions.length === 0)) {
          state.questions = initialQuestions;
        }
      },
    }
  )
);
