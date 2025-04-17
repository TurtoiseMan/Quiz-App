"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useEffect, useState } from "react";
import { Question } from "@/types";

export default function QuestionsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const getQuestions = useQuizStore((state) => state.getQuestions);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setQuestions(getQuestions());
  }, [getQuestions]);

  if (!user || !isAdmin()) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Manage Questions</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add New Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-center text-black">
            No questions available yet. Click "Add New Question" to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <p className="text-black font-medium">{question.text}</p>
                <div className="space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(question.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
