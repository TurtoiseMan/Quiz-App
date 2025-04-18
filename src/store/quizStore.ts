import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question, Answer } from "@/types";
import {
  questions as initialQuestions,
  answers as initialAnswers,
} from "@/data/mockData";

interface QuizState {
  questions: Question[];
  answers: Answer[];

  getQuestions: () => Question[];
  addQuestion: (text: string, createdBy: string) => Question;
  updateQuestion: (id: string, text: string) => Question | null;
  deleteQuestion: (id: string) => boolean;

  getAnswers: () => Answer[];
  getAnswersByQuestion: (questionId: string) => Answer[];
  getAnswersByUser: (userId: string) => Answer[];
  getAnswerByQuestionAndUser: (
    questionId: string,
    userId: string
  ) => Answer | undefined;
  addAnswer: (questionId: string, userId: string, text: string) => Answer;
  updateAnswer: (id: string, text: string) => Answer | null;

  initializeStore: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: initialQuestions,
      answers: initialAnswers,

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

      getAnswers: () => get().answers,

      getAnswersByQuestion: (questionId: string) => {
        return get().answers.filter((a) => a.questionId === questionId);
      },

      getAnswersByUser: (userId: string) => {
        return get().answers.filter((a) => a.userId === userId);
      },

      getAnswerByQuestionAndUser: (questionId: string, userId: string) => {
        return get().answers.find(
          (a) => a.questionId === questionId && a.userId === userId
        );
      },

      addAnswer: (questionId: string, userId: string, text: string) => {
        const newAnswer: Answer = {
          id: Date.now().toString(),
          questionId,
          userId,
          text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [],
        };

        set((state) => ({
          answers: [...state.answers, newAnswer],
        }));

        return newAnswer;
      },

      updateAnswer: (id: string, text: string) => {
        let updatedAnswer: Answer | null = null;

        set((state) => {
          const answers = [...state.answers];
          const index = answers.findIndex((a) => a.id === id);

          if (index === -1) return state;

          const oldAnswer = answers[index];
          const history = oldAnswer.history || [];

          updatedAnswer = {
            ...oldAnswer,
            text,
            updatedAt: new Date().toISOString(),
            history: [
              ...history,
              {
                text: oldAnswer.text,
                updatedAt: oldAnswer.updatedAt,
              },
            ],
          };

          answers[index] = updatedAnswer!;
          return { answers };
        });

        return updatedAnswer;
      },

      initializeStore: () => {
        set((state) => ({ ...state }));
      },
    }),
    {
      name: "quiz-data-storage",
      partialize: (state) => ({
        questions: state.questions,
        answers: state.answers,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.questions || state.questions.length === 0) {
            state.questions = initialQuestions;
          }
          if (!state.answers || state.answers.length === 0) {
            state.answers = initialAnswers;
          }
        }
      },
    }
  )
);
