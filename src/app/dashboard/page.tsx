"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useEffect, useState } from "react";
import { Quiz, Question, QuizAttempt } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const getQuizzes = useQuizStore((state) => state.getQuizzes);
  const createQuiz = useQuizStore((state) => state.createQuiz);
  const updateQuiz = useQuizStore((state) => state.updateQuiz);
  const deleteQuiz = useQuizStore((state) => state.deleteQuiz);
  const getQuestions = useQuizStore((state) => state.getQuestions);
  
  const getQuizAttemptsByUser = useQuizStore((state) => state.getQuizAttemptsByUser);
  const startQuizAttempt = useQuizStore((state) => state.startQuizAttempt);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuizzes(getQuizzes());
    
    if (isAdmin()) {
      setQuestions(getQuestions());
    }
    
    if (user) {
      setQuizAttempts(getQuizAttemptsByUser(user.id));
    }
  }, [getQuizzes, getQuestions, getQuizAttemptsByUser, isAdmin, user]);

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

  const handleStartQuiz = (quizId: string) => {
    if (!user) return;
    
    const attempt = startQuizAttempt(quizId, user.id);
    
    router.push(`/dashboard/questions?attemptId=${attempt.id}`);
  };
  
  const calculateTimeRemaining = (quiz: Quiz, attempt: QuizAttempt) => {
    if (attempt.completedAt) return "Completed";
    
    const startTime = new Date(attempt.startedAt).getTime();
    const timeLimitMs = quiz.timeLimit * 60 * 1000;
    const endTime = startTime + timeLimitMs;
    const now = new Date().getTime();
    
    if (now > endTime) return "Time expired";
    
    const remainingMs = endTime - now;
    const remainingMin = Math.floor(remainingMs / (60 * 1000));
    const remainingSec = Math.floor((remainingMs % (60 * 1000)) / 1000);
    
    return `${remainingMin}m ${remainingSec}s remaining`;
  };

  const getQuizById = (quizId: string) => {
    return quizzes.find(quiz => quiz.id === quizId);
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
        <div>
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2 text-black">
              Student Dashboard
            </h2>
            <p className="text-black">
              Welcome {user.username}! Here you can take quizzes and view your past results.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-black">Your Quiz Attempts</h2>
            
            {quizAttempts.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-black">You haven't attempted any quizzes yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizAttempts.map((attempt) => {
                  const quiz = getQuizById(attempt.quizId);
                  if (!quiz) return null;
                  
                  return (
                    <div key={attempt.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-black">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">
                            Started: {new Date(attempt.startedAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          {attempt.completedAt ? (
                            <div className="text-right">
                              <span className="bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full text-xs">
                                Score: {attempt.score !== undefined ? `${attempt.score}%` : 'N/A'}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                Completed: {new Date(attempt.completedAt).toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <div className="flex space-x-2 items-center">
                              <span className="text-xs text-orange-600">
                                {calculateTimeRemaining(quiz, attempt)}
                              </span>
                              <Link 
                                href={`/dashboard/questions?attemptId=${attempt.id}`}
                                className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                              >
                                Continue
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-black">Available Quizzes</h2>
            
            {quizzes.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-black">No quizzes are available right now. Check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => {
                  const hasCompletedAttempt = quizAttempts.some(
                    attempt => attempt.quizId === quiz.id && attempt.completedAt
                  );
                  
                  const inProgressAttempt = quizAttempts.find(
                    attempt => attempt.quizId === quiz.id && !attempt.completedAt
                  );
                  
                  return (
                    <div key={quiz.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition">
                      <h3 className="font-semibold text-lg text-black mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {quiz.questionIds.length} questions
                        </span>
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                          {quiz.timeLimit} min
                        </span>
                      </div>
                      
                      {inProgressAttempt ? (
                        <Link
                          href={`/dashboard/questions?attemptId=${inProgressAttempt.id}`}
                          className="block w-full bg-yellow-500 hover:bg-yellow-600 text-center text-white py-2 px-4 rounded-md font-medium"
                        >
                          Continue Quiz
                        </Link>
                      ) : hasCompletedAttempt ? (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">
                            Already completed
                          </span>
                          <button
                            onClick={() => handleStartQuiz(quiz.id)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-md text-sm"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                        >
                          Start Quiz
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
