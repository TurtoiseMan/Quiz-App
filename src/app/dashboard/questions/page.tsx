"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useEffect, useState } from "react";
import { Question, Quiz, QuizAttempt } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

export default function QuestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const getQuestions = useQuizStore((state) => state.getQuestions);
  const addQuestion = useQuizStore((state) => state.addQuestion);
  const updateQuestion = useQuizStore((state) => state.updateQuestion);
  const deleteQuestion = useQuizStore((state) => state.deleteQuestion);

  const getQuizAttemptById = useQuizStore((state) => state.getQuizAttemptById);
  const getQuizById = useQuizStore((state) => state.getQuizById);
  const submitQuizAnswer = useQuizStore((state) => state.submitQuizAnswer);
  const completeQuizAttempt = useQuizStore(
    (state) => state.completeQuizAttempt
  );

  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");

  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(
    null
  );
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setQuestions(getQuestions());
      return;
    }

    const attempt = getQuizAttemptById(attemptId);
    if (!attempt) {
      setError("Quiz attempt not found");
      return;
    }

    setCurrentAttempt(attempt);

    const quiz = getQuizById(attempt.quizId);
    if (!quiz) {
      setError("Quiz not found");
      return;
    }

    setCurrentQuiz(quiz);

    const allQuestions = getQuestions();
    const filteredQuestions = allQuestions.filter((q) =>
      quiz.questionIds.includes(q.id)
    );
    setQuizQuestions(filteredQuestions);

    const answers: Record<string, string> = {};
    attempt.answers.forEach((ans) => {
      answers[ans.questionId] = ans.answerId;
    });
    setSelectedAnswers(answers);

    if (!attempt.completedAt) {
      const startTime = new Date(attempt.startedAt).getTime();
      const timeLimitMs = quiz.timeLimit * 60 * 1000;
      const endTime = startTime + timeLimitMs;
      const now = new Date().getTime();

      const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remainingTime);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setIsQuizCompleted(true);
      setQuizScore(attempt.score || 0);
    }
  }, [attemptId, getQuestions, getQuizAttemptById, getQuizById]);

  if (!user) {
    router.push("/signin");
    return null;
  }

  if (!attemptId && !isAdmin()) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 font-medium">
          Access denied. You need admin privileges to manage questions.
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    if (isQuizCompleted) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));

    if (currentAttempt) {
      submitQuizAnswer(currentAttempt.id, questionId, answerId);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!currentAttempt) return;

    const completedAttempt = completeQuizAttempt(currentAttempt.id);
    if (completedAttempt) {
      setIsQuizCompleted(true);
      setQuizScore(completedAttempt.score || 0);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAddQuestion = () => {
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setError("");
    setIsAddingQuestion(true);
    setEditingQuestionId(null);
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionText(question.text);
    setOptions([...question.options]);
    setCorrectAnswer(question.correctAnswer);
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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      setError("Question text cannot be empty");
      return;
    }

    if (options.some((option) => !option.trim())) {
      setError("All options must be filled");
      return;
    }

    if (!correctAnswer) {
      setError("Please select a correct answer");
      return;
    }

    try {
      if (editingQuestionId) {
        updateQuestion(editingQuestionId, questionText, options, correctAnswer);
        setQuestions(getQuestions());
      } else if (user) {
        const newQuestion = addQuestion(questionText, user.id);
        updateQuestion(newQuestion.id, questionText, options, correctAnswer);
        setQuestions(getQuestions());
      }

      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setIsAddingQuestion(false);
      setEditingQuestionId(null);
      setError("");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsAddingQuestion(false);
    setEditingQuestionId(null);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setError("");
  };

  if (attemptId) {
    if (error) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 font-medium">{error}</div>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    if (isQuizCompleted) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-black mb-6">Quiz Complete!</h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-black mb-2">
              {currentQuiz?.title}
            </h2>
            <p className="text-gray-700 mb-4">{currentQuiz?.description}</p>

            <div className="text-center">
              <p className="text-xl font-bold text-black mb-2">Your Score:</p>
              <p className="text-3xl font-bold text-blue-600">
                {quizScore?.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-black">Question Review:</h3>
            <div className="space-y-6">
              {quizQuestions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-6 h-6 rounded-full text-center text-white text-sm font-medium bg-gray-500">
                        {index + 1}
                      </span>
                      <h4 className="font-medium text-black">
                        {question.text}
                      </h4>
                    </div>

                    <div className="ml-8 mt-3 space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option}
                          className={`p-2 rounded flex items-center text-black  ${
                            option === question.correctAnswer
                              ? "bg-green-50 border border-green-200"
                              : option === userAnswer &&
                                option !== question.correctAnswer
                              ? "bg-red-50 border border-red-200"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          {option === question.correctAnswer && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-green-500 mr-2"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}

                          {option === userAnswer &&
                            option !== question.correctAnswer && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-red-500 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}

                          {option === userAnswer ? (
                            <span className="font-medium">
                              {option} (Your answer)
                            </span>
                          ) : option === question.correctAnswer ? (
                            <span className="font-medium">
                              {option} (Correct answer)
                            </span>
                          ) : (
                            <span>{option}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div
                      className={`mt-3 p-2 rounded-md text-sm font-medium ${
                        isCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isCorrect ? "Correct! ✓" : "Incorrect! ✗"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    if (!currentQuiz || quizQuestions.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-gray-700">Loading quiz questions...</p>
          </div>
        </div>
      );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">{currentQuiz.title}</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Time remaining:</span>
            <span
              className={`font-bold ${
                timeRemaining < 60 ? "text-red-600" : "text-black"
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="text-sm text-gray-600 mb-2">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </div>

          <h2 className="text-lg font-medium mb-4 text-black">
            {currentQuestion.text}
          </h2>

          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`p-3 rounded-md cursor-pointer border text-black ${
                  selectedAnswers[currentQuestion.id] === option
                    ? "bg-blue-100 border-blue-400"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-md ${
              currentQuestionIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            Previous
          </button>

          {currentQuestionIndex < quizQuestions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit Quiz
            </button>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center">
          <div className="flex space-x-1">
            {quizQuestions.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  index === currentQuestionIndex
                    ? "bg-blue-600"
                    : selectedAnswers[quizQuestions[index].id]
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <span className="mr-2 w-6 text-center font-medium text-gray-700">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Enter option ${String.fromCharCode(
                        65 + index
                      )}...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-black"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="correctAnswer"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correct Answer
              </label>
              <select
                id="correctAnswer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-black"
              >
                <option value="" disabled>
                  Select the correct answer...
                </option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {String.fromCharCode(65 + index)}: {option}
                  </option>
                ))}
              </select>
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
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <span className="font-medium mr-1">
                        {String.fromCharCode(65 + index)}:
                      </span>{" "}
                      {option}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Correct Answer: {question.correctAnswer}
                </p>
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
