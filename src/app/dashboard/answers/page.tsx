"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useState, useEffect } from "react";
import { Question, Answer } from "@/types";
import {
  Button,
  Radio,
  Card,
  Typography,
  Badge,
  Alert,
  Collapse,
  Space,
  Divider,
  message,
} from "antd";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

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
  const [messageApi, contextHolder] = message.useMessage();

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
          messageApi.success("Answer updated successfully");
        } else {
          addAnswer(selectedQuestion.id, user.id, answerText);
          messageApi.success("Answer submitted successfully");
        }

        setUserAnswers(getAnswersByUser(user.id));
        setShowFeedback(true);
        setError("");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      messageApi.error("Failed to submit answer");
      console.error(err);
    }
  };

  const isCorrectAnswer = () => {
    return selectedQuestion && answerText === selectedQuestion.correctAnswer;
  };

  const renderAdminView = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {contextHolder}
      <Title level={2}>All Answers</Title>

      {questions.length === 0 ? (
        <Alert
          type="info"
          message="No questions have been created yet."
          showIcon
        />
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {questions.map((question) => {
            const questionAnswers = getAnswersByQuestion(question.id);
            return (
              <Card key={question.id}>
                <Title level={4}>{question.text}</Title>

                {questionAnswers.length === 0 ? (
                  <Text type="secondary">
                    No answers submitted for this question yet.
                  </Text>
                ) : (
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    {questionAnswers.map((answer) => (
                      <Card
                        key={answer.id}
                        size="small"
                        style={{ backgroundColor: "#f9f9f9" }}
                      >
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <Text strong>Selected option: {answer.text}</Text>

                          <Space split={<Divider type="vertical" />}>
                            <Text type="secondary">
                              Username: {getUsernameById(answer.userId)}
                            </Text>
                            <Text type="secondary">
                              Last updated:{" "}
                              {new Date(answer.updatedAt).toLocaleString()}
                            </Text>
                            {answer.history && answer.history.length > 0 ? (
                              <Text type="secondary">
                                Changed {answer.history.length}{" "}
                                {answer.history.length === 1 ? "time" : "times"}
                              </Text>
                            ) : (
                              <Text type="secondary">Original selection</Text>
                            )}
                          </Space>

                          {answer.history && answer.history.length > 0 && (
                            <Collapse ghost>
                              <Panel header="View change history" key="1">
                                <Space
                                  direction="vertical"
                                  size="small"
                                  style={{ width: "100%" }}
                                >
                                  {answer.history.map((historyItem, index) => (
                                    <div key={index}>
                                      <Text>Selected: {historyItem.text}</Text>
                                      <br />
                                      <Text type="secondary">
                                        {new Date(
                                          historyItem.updatedAt
                                        ).toLocaleString()}
                                      </Text>
                                    </div>
                                  ))}
                                </Space>
                              </Panel>
                            </Collapse>
                          )}
                        </Space>
                      </Card>
                    ))}
                  </Space>
                )}
              </Card>
            );
          })}
        </Space>
      )}
    </Space>
  );

  const renderUserView = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {contextHolder}
      <Title level={2}>Answer Questions</Title>

      {selectedQuestion ? (
        <Card>
          <Title level={4}>{selectedQuestion.text}</Title>

          <form onSubmit={handleSubmitAnswer}>
            {error && (
              <Alert
                type="error"
                message={error}
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Choose an option:
              </Text>
              <Radio.Group
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                style={{ width: "100%" }}
              >
                <Space direction="vertical">
                  {selectedQuestion?.options.map((option) => (
                    <Radio key={option} value={option}>
                      {option}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button
                onClick={() => {
                  setSelectedQuestion(null);
                  setAnswerText("");
                  setEditingAnswerId(null);
                  setShowFeedback(false);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAnswerId ? "Update Answer" : "Submit Answer"}
              </Button>
            </div>
          </form>

          {showFeedback && (
            <div style={{ marginTop: 24 }}>
              <Alert
                type={isCorrectAnswer() ? "success" : "error"}
                message={
                  isCorrectAnswer()
                    ? "Your answer is correct!"
                    : "Your answer is incorrect."
                }
                description={
                  !isCorrectAnswer() &&
                  selectedQuestion && (
                    <Text strong>
                      Correct answer: {selectedQuestion.correctAnswer}
                    </Text>
                  )
                }
                showIcon
              />
            </div>
          )}

          {editingAnswerId && (
            <div style={{ marginTop: 24 }}>
              <Title level={5}>Answer History</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                {getAnswerByQuestionAndUser(
                  selectedQuestion.id,
                  user!.id
                )?.history?.map((historyItem, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{ backgroundColor: "#f9f9f9" }}
                  >
                    <Text>{historyItem.text}</Text>
                    <br />
                    <Text type="secondary">
                      Updated:{" "}
                      {new Date(historyItem.updatedAt).toLocaleString()}
                    </Text>
                  </Card>
                ))}
              </Space>
            </div>
          )}
        </Card>
      ) : (
        <div>
          <Alert
            type="warning"
            message={
              userAnswers.length > 0
                ? "You can edit your previous answers by selecting a question."
                : "Click on a question to provide your answer."
            }
            style={{ marginBottom: 16 }}
            showIcon
          />

          {questions.length === 0 ? (
            <Card>
              <Text type="secondary">No questions available yet.</Text>
            </Card>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {questions.map((question) => {
                const userAnswer = getAnswerByQuestionAndUser(
                  question.id,
                  user!.id
                );
                return (
                  <Card
                    key={question.id}
                    hoverable
                    onClick={() => handleQuestionSelect(question)}
                  >
                    <Space
                      align="start"
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Title level={5} style={{ margin: 0 }}>
                        {question.text}
                      </Title>
                      <Badge
                        status={userAnswer ? "success" : "default"}
                        text={userAnswer ? "Answered" : "Not answered"}
                      />
                    </Space>
                    {userAnswer && (
                      <Paragraph type="secondary" style={{ marginTop: 8 }}>
                        Your answer: {userAnswer.text}
                      </Paragraph>
                    )}
                  </Card>
                );
              })}
            </Space>
          )}
        </div>
      )}
    </Space>
  );

  if (!user) return null;

  return (
    <Card bordered={false}>
      {isAdmin() ? renderAdminView() : renderUserView()}
    </Card>
  );
}
