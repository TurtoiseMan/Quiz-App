"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useEffect, useState } from "react";
import { Quiz, Question } from "@/types";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const getQuizzes = useQuizStore((state) => state.getQuizzes);
  const createQuiz = useQuizStore((state) => state.createQuiz);
  const updateQuiz = useQuizStore((state) => state.updateQuiz);
  const deleteQuiz = useQuizStore((state) => state.deleteQuiz);
  const getQuestions = useQuizStore((state) => state.getQuestions);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin()) {
      setQuizzes(getQuizzes());
      setQuestions(getQuestions());
    }
  }, [getQuizzes, getQuestions, isAdmin]);

  if (!user) return null;

  const handleCreateQuiz = () => {
    setTitle("");
    setDescription("");
    setTimeLimit(30);
    setSelectedQuestionIds([]);
    setError("");
    setIsCreatingQuiz(true);
    setEditingQuizId(null);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setTitle(quiz.title);
    setDescription(quiz.description);
    setTimeLimit(quiz.timeLimit);
    setSelectedQuestionIds([...quiz.questionIds]);
    setError("");
    setIsCreatingQuiz(false);
    setEditingQuizId(quiz.id);
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      const success = deleteQuiz(quizId);
      if (success) {
        setQuizzes(getQuizzes());
      }
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Quiz title cannot be empty");
      return;
    }

    if (!description.trim()) {
      setError("Quiz description cannot be empty");
      return;
    }

    if (timeLimit <= 0) {
      setError("Time limit must be greater than 0");
      return;
    }

    if (selectedQuestionIds.length === 0) {
      setError("Please select at least one question for the quiz");
      return;
    }

    try {
      if (editingQuizId) {
        updateQuiz(
          editingQuizId,
          title,
          description,
          timeLimit,
          selectedQuestionIds
        );
      } else if (user) {
        createQuiz(title, description, timeLimit, selectedQuestionIds, user.id);
      }

      setTitle("");
      setDescription("");
      setTimeLimit(30);
      setSelectedQuestionIds([]);
      setIsCreatingQuiz(false);
      setEditingQuizId(null);
      setError("");
      setQuizzes(getQuizzes());
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsCreatingQuiz(false);
    setEditingQuizId(null);
    setTitle("");
    setDescription("");
    setTimeLimit(30);
    setSelectedQuestionIds([]);
    setError("");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Dashboard</h1>

      {isAdmin() ? (
        <div>
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2 text-black">
              Admin Dashboard
            </h2>
            <p className="text-black">
              Welcome {user.username}! You have access to manage questions and
              view all answers.
            </p>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Manage Quizzes</h2>
              {!isCreatingQuiz && !editingQuizId && (
                <button
                  onClick={handleCreateQuiz}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Create New Quiz
                </button>
              )}
            </div>

            {(isCreatingQuiz || editingQuizId) && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium mb-3 text-black">
                  {editingQuizId ? "Edit Quiz" : "Create New Quiz"}
                </h2>

                <form onSubmit={handleSubmitQuiz}>
                  {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quiz Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-black"
                      placeholder="Enter quiz title..."
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quiz Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-black"
                      rows={3}
                      placeholder="Enter quiz description..."
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="timeLimit"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Time Limit (minutes)
                    </label>
                    <input
                      id="timeLimit"
                      type="number"
                      min="1"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-black"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Questions
                    </label>
                    {questions.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No questions available. Please create questions first.
                      </p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                        {questions.map((question) => (
                          <div
                            key={question.id}
                            className="flex items-center mb-2 p-2 hover:bg-gray-100 rounded"
                          >
                            <input
                              type="checkbox"
                              id={`question-${question.id}`}
                              checked={selectedQuestionIds.includes(
                                question.id
                              )}
                              onChange={() =>
                                toggleQuestionSelection(question.id)
                              }
                              className="mr-2"
                            />
                            <label
                              htmlFor={`question-${question.id}`}
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {question.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-1 text-sm text-gray-600">
                      {selectedQuestionIds.length} question(s) selected
                    </div>
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
                      disabled={questions.length === 0}
                    >
                      {editingQuizId ? "Update" : "Create"} Quiz
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!isCreatingQuiz && !editingQuizId && quizzes.length === 0 ? (
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-center text-black">
                  No quizzes available yet. Click "Create New Quiz" to create
                  one.
                </p>
              </div>
            ) : (
              !isCreatingQuiz &&
              !editingQuizId && (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-lg text-black">
                            {quiz.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {quiz.description}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEditQuiz(quiz)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        <p>Time Limit: {quiz.timeLimit} minutes</p>
                        <p>Questions: {quiz.questionIds.length}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(quiz.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-black">
            User Dashboard
          </h2>
          <p className="text-black">
            Welcome {user.username}! You can answer questions and view/edit your
            responses.
          </p>
        </div>
      )}
    </div>
  );
}
