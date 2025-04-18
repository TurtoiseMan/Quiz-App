import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question, Answer, Quiz } from "@/types";
import {
  questions as initialQuestions,
  answers as initialAnswers,
} from "@/data/mockData";

interface QuizState {
  questions: Question[];
  answers: Answer[];
  quizzes: Quiz[];

  getQuestions: () => Question[];
  addQuestion: (text: string, createdBy: string) => Question;
  updateQuestion: (
    id: string,
    text: string,
    options?: string[],
    correctAnswer?: string
  ) => Question | null;
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

  getQuizzes: () => Quiz[];
  getQuizById: (id: string) => Quiz | undefined;
  createQuiz: (
    title: string,
    description: string,
    timeLimit: number,
    questionIds: string[],
    createdBy: string
  ) => Quiz;
  updateQuiz: (
    id: string,
    title?: string,
    description?: string,
    timeLimit?: number,
    questionIds?: string[]
  ) => Quiz | null;
  deleteQuiz: (id: string) => boolean;

  initializeStore: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: initialQuestions,
      answers: initialAnswers,
      quizzes: [],

      getQuestions: () => get().questions,

      addQuestion: (text: string, createdBy: string) => {
        const newQuestion: Question = {
          id: Date.now().toString(),
          text,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          questions: [...state.questions, newQuestion],
        }));

        return newQuestion;
      },

      updateQuestion: (
        id: string,
        text: string,
        options?: string[],
        correctAnswer?: string
      ) => {
        let updatedQuestion: Question | null = null;

        set((state) => {
          const questions = [...state.questions];
          const index = questions.findIndex((q) => q.id === id);

          if (index === -1) return state;

          updatedQuestion = {
            ...questions[index],
            text,
            options: options || questions[index].options,
            correctAnswer: correctAnswer || questions[index].correctAnswer,
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

      getQuizzes: () => get().quizzes,

      getQuizById: (id: string) => {
        return get().quizzes.find((q) => q.id === id);
      },

      createQuiz: (
        title: string,
        description: string,
        timeLimit: number,
        questionIds: string[],
        createdBy: string
      ) => {
        const newQuiz: Quiz = {
          id: Date.now().toString(),
          title,
          description,
          timeLimit,
          questionIds,
          createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          quizzes: [...state.quizzes, newQuiz],
        }));

        return newQuiz;
      },

      updateQuiz: (
        id: string,
        title?: string,
        description?: string,
        timeLimit?: number,
        questionIds?: string[]
      ) => {
        let updatedQuiz: Quiz | null = null;

        set((state) => {
          const quizzes = [...state.quizzes];
          const index = quizzes.findIndex((q) => q.id === id);

          if (index === -1) return state;

          const currentQuiz = quizzes[index];
          updatedQuiz = {
            ...currentQuiz,
            title: title || currentQuiz.title,
            description: description || currentQuiz.description,
            timeLimit:
              timeLimit !== undefined ? timeLimit : currentQuiz.timeLimit,
            questionIds: questionIds || currentQuiz.questionIds,
            updatedAt: new Date().toISOString(),
          };

          quizzes[index] = updatedQuiz!;
          return { quizzes };
        });

        return updatedQuiz;
      },

      deleteQuiz: (id: string) => {
        let success = false;

        set((state) => {
          const quizzes = state.quizzes.filter((q) => q.id !== id);

          if (quizzes.length === state.quizzes.length) {
            return state;
          }

          success = true;
          return { quizzes };
        });

        return success;
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
        quizzes: state.quizzes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.questions || state.questions.length === 0) {
            state.questions = initialQuestions;
          }
          if (!state.answers || state.answers.length === 0) {
            state.answers = initialAnswers;
          }
          if (!state.quizzes) {
            state.quizzes = [];
          }
        }
      },
    }
  )
);
