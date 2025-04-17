"use client";

import { useAuthStore } from "@/store/authStore";

export default function QuestionsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!user || !isAdmin()) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Manage Questions</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add New Question
        </button>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <p className="text-center text-black">
          This is the admin-only questions management page. Here you will be
          able to create, edit, and delete quiz questions.
        </p>
      </div>
    </div>
  );
}
