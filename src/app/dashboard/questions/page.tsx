"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useEffect, useState } from "react";
import { Question } from "@/types";

export default function QuestionsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const getQuestions = useQuizStore((state) => state.getQuestions);
  const addQuestion = useQuizStore((state) => state.addQuestion);
  const updateQuestion = useQuizStore((state) => state.updateQuestion);
  const deleteQuestion = useQuizStore((state) => state.deleteQuestion);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [questionText, setQuestionText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setQuestions(getQuestions());
  }, [getQuestions]);

  if (!user || !isAdmin()) return null;

  const handleAddQuestion = () => {
    setQuestionText("");
    setError("");
    setIsAddingQuestion(true);
    setEditingQuestionId(null);
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionText(question.text);
    setError("");
    setIsAddingQuestion(false);
    setEditingQuestionId(question.id);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const success = deleteQuestion(questionId);
      if (success) {
        setQuestions(getQuestions());
      }
    }
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      setError("Question text cannot be empty");
      return;
    }

    try {
      if (editingQuestionId) {
        updateQuestion(editingQuestionId, questionText);
      } else if (user) {
        addQuestion(questionText, user.id);
      }

      setQuestionText("");
      setIsAddingQuestion(false);
      setEditingQuestionId(null);
      setError("");
      setQuestions(getQuestions());
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsAddingQuestion(false);
    setEditingQuestionId(null);
    setQuestionText("");
    setError("");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Manage Questions</h1>
        {!isAddingQuestion && !editingQuestionId && (
          <button
            onClick={handleAddQuestion}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add New Question
          </button>
        )}
      </div>

      {(isAddingQuestion || editingQuestionId) && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-3 text-black">
            {editingQuestionId ? "Edit Question" : "Add New Question"}
          </h2>

          <form onSubmit={handleSubmitQuestion}>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="questionText"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Question Text
              </label>
              <textarea
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-black"
                rows={3}
                placeholder="Enter the question text..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {editingQuestionId ? "Update" : "Add"} Question
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAddingQuestion && !editingQuestionId && questions.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-center text-black">
            No questions available yet. Click "Add New Question" to create one.
          </p>
        </div>
      ) : (
        !isAddingQuestion &&
        !editingQuestionId && (
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <p className="text-black font-medium">{question.text}</p>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800"
                    >
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
        )
      )}
    </div>
  );
}
