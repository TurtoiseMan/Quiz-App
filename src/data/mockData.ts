import { User, Question, Answer } from "../types";

// Mock user data
export const users: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    id: "2",
    username: "user1",
    password: "user123",
    role: "user",
  },
  {
    id: "3",
    username: "user2",
    password: "user456",
    role: "user",
  },
];

// Mock questions data
export const questions: Question[] = [
  {
    id: "1",
    text: "What is React?",
    createdAt: "2023-01-01T12:00:00Z",
    updatedAt: "2023-01-01T12:00:00Z",
    createdBy: "1",
  },
  {
    id: "2",
    text: "What are the key features of Next.js?",
    createdAt: "2023-01-02T14:30:00Z",
    updatedAt: "2023-01-02T14:30:00Z",
    createdBy: "1",
  },
];

// Mock answers data
export const answers: Answer[] = [
  {
    id: "1",
    questionId: "1",
    userId: "2",
    text: "React is a JavaScript library for building user interfaces.",
    createdAt: "2023-01-03T10:15:00Z",
    updatedAt: "2023-01-03T10:15:00Z",
  },
  {
    id: "2",
    questionId: "2",
    userId: "3",
    text: "Next.js features include server-side rendering, static site generation, and API routes.",
    createdAt: "2023-01-04T09:20:00Z",
    updatedAt: "2023-01-04T09:20:00Z",
    history: [
      {
        text: "Next.js is a React framework.",
        updatedAt: "2023-01-03T16:45:00Z",
      },
    ],
  },
];
