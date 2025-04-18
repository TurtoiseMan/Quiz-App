export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "user";
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  history?: AnswerHistory[];
}

export interface AnswerHistory {
  text: string;
  updatedAt: string;
}
