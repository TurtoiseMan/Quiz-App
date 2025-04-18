"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useState, useEffect } from "react";
import { Question, Answer } from "@/types";

export default function AnswersPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const users = useAuthStore((state) => state.users);

  const getQuestions = useQuizStore((state) => state.getQuestions);
  const getAnswersByQuestion = useQuizStore(
    (state) => state.getAnswersByQuestion
  );
  const getAnswersByUser = useQuizStore((state) => state.getAnswersByUser);
  const getAnswerByQuestionAndUser = useQuizStore(
    (state) => state.getAnswerByQuestionAndUser
  );
  const addAnswer = useQuizStore((state) => state.addAnswer);
  const updateAnswer = useQuizStore((state) => state.updateAnswer);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [answerText, setAnswerText] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const getUsernameById = (userId: string) => {
    const foundUser = users.find((u) => u.id === userId);
    return foundUser ? foundUser.username : userId;
  };

  useEffect(() => {
    const allQuestions = getQuestions();
    setQuestions(allQuestions);

    if (user) {
      if (isAdmin()) {
        setQuestions(allQuestions);
      } else {
        const userAnswersData = getAnswersByUser(user.id);
        setUserAnswers(userAnswersData);
      }
    }
  }, [user, isAdmin, getQuestions, getAnswersByUser]);

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    setShowFeedback(false);

    if (!isAdmin() && user) {
      const existingAnswer = getAnswerByQuestionAndUser(question.id, user.id);
      if (existingAnswer) {
        setAnswerText(existingAnswer.text);
        setEditingAnswerId(existingAnswer.id);
      } else {
        setAnswerText("");
        setEditingAnswerId(null);
      }
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!answerText.trim()) {
      setError("Answer text cannot be empty");
      return;
    }

    try {
      if (selectedQuestion && user) {
        if (editingAnswerId) {
          updateAnswer(editingAnswerId, answerText);
        } else {
          addAnswer(selectedQuestion.id, user.id, answerText);
        }

        setUserAnswers(getAnswersByUser(user.id));
        setShowFeedback(true);
        setError("");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  const isCorrectAnswer = () => {
    return selectedQuestion && answerText === selectedQuestion.correctAnswer;
  };

  const renderAdminView = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">All Answers</h1>

      {questions.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-black">No questions have been created yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => {
            const questionAnswers = getAnswersByQuestion(question.id);
            return (
              <div key={question.id} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-black mb-4">
                  {question.text}
                </h2>

                {questionAnswers.length === 0 ? (
                  <p className="text-gray-500">
                    No answers submitted for this question yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {questionAnswers.map((answer) => (
                      <div
                        key={answer.id}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex justify-between">
                          <p className="text-black">
                            Selected option:{" "}
                            <span className="font-medium">{answer.text}</span>
                          </p>
                        </div>
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            Username: {getUsernameById(answer.userId)} | Last
                            updated:{" "}
                            {new Date(answer.updatedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-600">
                            {answer.history && answer.history.length > 0
                              ? `Changed ${answer.history.length} ${
                                  answer.history.length === 1 ? "time" : "times"
                                }`
                              : "Original selection"}
                          </p>
                        </div>

                        {answer.history && answer.history.length > 0 && (
                          <div className="mt-3">
                            <details className="text-sm">
                              <summary className="text-blue-600 cursor-pointer">
                                View change history
                              </summary>
                              <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                                {answer.history.map((historyItem, index) => (
                                  <div key={index} className="text-gray-700">
                                    <p>Selected: {historyItem.text}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(
                                        historyItem.updatedAt
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderUserView = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">Answer Questions</h1>

      {selectedQuestion ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-black mb-4">
            {selectedQuestion.text}
          </h2>

          <form onSubmit={handleSubmitAnswer}>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose an option:
              </label>
              <div className="space-y-3">
                {selectedQuestion?.options.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      id={`option-${option}`}
                      name="answer-option"
                      type="radio"
                      value={option}
                      checked={answerText === option}
                      onChange={() => setAnswerText(option)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor={`option-${option}`}
                      className="ml-3 block text-sm font-medium text-black"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedQuestion(null);
                  setAnswerText("");
                  setEditingAnswerId(null);
                  setShowFeedback(false);
                }}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {editingAnswerId ? "Update Answer" : "Submit Answer"}
              </button>
            </div>
          </form>

          {showFeedback && (
            <div className="mt-6">
              <div
                className={`p-4 rounded ${
                  isCorrectAnswer()
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {isCorrectAnswer()
                  ? "Your answer is correct!"
                  : "Your answer is incorrect."}

                {!isCorrectAnswer() && selectedQuestion && (
                  <div className="mt-2">
                    <p className="font-medium">
                      Correct answer: {selectedQuestion.correctAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {editingAnswerId && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-black mb-2">
                Answer History
              </h3>
              {getAnswerByQuestionAndUser(
                selectedQuestion.id,
                user!.id
              )?.history?.map((historyItem, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                  <p className="text-black">{historyItem.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated: {new Date(historyItem.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <p className="text-sm text-yellow-700">
                {userAnswers.length > 0
                  ? "You can edit your previous answers by selecting a question."
                  : "Click on a question to provide your answer."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow divide-y">
            {questions.length === 0 ? (
              <div className="p-6">
                <p className="text-gray-500">No questions available yet.</p>
              </div>
            ) : (
              questions.map((question) => {
                const userAnswer = getAnswerByQuestionAndUser(
                  question.id,
                  user!.id
                );
                return (
                  <div
                    key={question.id}
                    className="p-6 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleQuestionSelect(question)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-black">
                        {question.text}
                      </h3>
                      {userAnswer ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                          Answered
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800">
                          Not answered
                        </span>
                      )}
                    </div>
                    {userAnswer && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        Your answer: {userAnswer.text}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {isAdmin() ? renderAdminView() : renderUserView()}
    </div>
  );
}
