"use client";

import { User } from "@/types";
import { getCurrentUser } from "@/data/storageService";
import { useEffect, useState } from "react";

export default function AnswersPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">
        {user?.role === "admin" ? "View All Answers" : "Answer Questions"}
      </h1>

      {user?.role === "admin" ? (
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
