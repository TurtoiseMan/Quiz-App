import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
import { users as initialUsers } from "@/data/mockData";

interface AuthState {
  user: User | null;
  users: User[];
  loading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: initialUsers,
      loading: false,

      login: (username: string, password: string) => {
        const users = get().users;
        const user = users.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          set({ user });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null });
      },

      isAdmin: () => {
        const user = get().user;
        return !!user && user.role === "admin";
      },
    }),
    {
      name: "quiz-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ users: state.users, user: state.user }),
    }
  )
);
