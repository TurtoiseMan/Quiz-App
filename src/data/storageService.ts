import { User } from "../types";
import {
  users as initialUsers,
  questions as initialQuestions,
  answers as initialAnswers,
} from "./mockData";

const USERS_KEY = "quiz_app_users";
const QUESTIONS_KEY = "quiz_app_questions";
const ANSWERS_KEY = "quiz_app_answers";
const CURRENT_USER_KEY = "quiz_app_current_user";

const isBrowser = typeof window !== "undefined";

const initializeData = () => {
  if (!isBrowser) return;

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }

  if (!localStorage.getItem(QUESTIONS_KEY)) {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(initialQuestions));
  }

  if (!localStorage.getItem(ANSWERS_KEY)) {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(initialAnswers));
  }
};

export const getUsers = (): User[] => {
  if (!isBrowser) return [];
  initializeData();
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  if (!isBrowser) return null;
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);
  return currentUser ? JSON.parse(currentUser) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (!isBrowser) return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logout = (): void => {
  setCurrentUser(null);
};

if (isBrowser) {
  initializeData();
}
