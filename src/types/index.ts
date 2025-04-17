export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface Question {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  history?: {
    text: string;
    updatedAt: string;
  }[];
}