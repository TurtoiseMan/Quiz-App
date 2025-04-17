"use client";

import { useAuthStore } from "@/store/authStore";

export default function AnswersPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">
        {isAdmin() ? "View All Answers" : "Answer Questions"}
      </h1>

      {isAdmin() ? (
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-black">
            This is the admin view of the answers page. Here you can view all
            answers submitted by users.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 p-6 rounded-lg">
          <p className="text-black">
            This is the user view of the answers page. Here you can submit
            answers to questions and edit your previous answers.
          </p>
        </div>
      )}
    </div>
  );
}
