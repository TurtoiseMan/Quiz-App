import { Question, Answer, User } from "@/types";

export const users: User[] = [
  {
    id: "admin_id",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    id: "user1_id",
    username: "user1",
    password: "user123",
    role: "user",
  },
];

export const questions: Question[] = [
  {
    id: "q1",
    text: "Which CSS property is used to control the space between elements' content and their borders?",
    options: ["margin", "padding", "spacing", "border-spacing"],
    correctAnswer: "padding",
    createdBy: "admin_id",
    createdAt: "2023-01-01T10:00:00.000Z",
    updatedAt: "2023-01-01T10:00:00.000Z",
  },
  {
    id: "q2",
    text: "Which JavaScript method is used to add an element at the end of an array?",
    options: ["push()", "append()", "addLast()", "concat()"],
    correctAnswer: "push()",
    createdBy: "admin_id",
    createdAt: "2023-01-02T10:00:00.000Z",
    updatedAt: "2023-01-02T10:00:00.000Z",
  },
  {
    id: "q3",
    text: "What does the 'C' in CSS stand for?",
    options: ["Computer", "Cascading", "Colorful", "Creative"],
    correctAnswer: "Cascading",
    createdBy: "admin_id",
    createdAt: "2023-01-03T10:00:00.000Z",
    updatedAt: "2023-01-03T10:00:00.000Z",
  },
  {
    id: "q4",
    text: "Which React hook is used to add state to a functional component?",
    options: ["useEffect", "useState", "useContext", "useReducer"],
    correctAnswer: "useState",
    createdBy: "admin_id",
    createdAt: "2023-01-04T10:00:00.000Z",
    updatedAt: "2023-01-04T10:00:00.000Z",
  },
  {
    id: "q5",
    text: "Which HTML tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correctAnswer: "<a>",
    createdBy: "admin_id",
    createdAt: "2023-01-05T10:00:00.000Z",
    updatedAt: "2023-01-05T10:00:00.000Z",
  },
];

export const answers: Answer[] = [
  {
    id: "a1",
    questionId: "q1",
    userId: "user1_id",
    text: "padding",
    createdAt: "2023-01-10T14:30:00.000Z",
    updatedAt: "2023-01-10T14:30:00.000Z",
    history: [],
  },
];
