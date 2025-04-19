"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Typography,
  Card,
  Space,
  Descriptions,
  List,
  Tag,
  Progress,
  Button,
  Divider,
} from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LeftOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useQuizStore } from "@/store/quizStore";
import { useAuthStore } from "@/store/authStore";
import { QuizAttempt, Quiz, Question } from "@/types";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;


export default function QuizAttemptDetailPage() {
  const params = useParams();
  const attemptId = params.id as string;
  const router = useRouter();
  const users = useAuthStore((state) => state.users);
  const user = useAuthStore((state) => state.user);
  const getQuizAttemptById = useQuizStore((state) => state.getQuizAttemptById);
  const getQuizById = useQuizStore((state) => state.getQuizById);
  const getQuestions = useQuizStore((state) => state.getQuestions);

  const [attempt, setAttempt] = useState<QuizAttempt | undefined>(undefined);
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }

    const quizAttempt = getQuizAttemptById(attemptId);

    if (
      !quizAttempt ||
      (quizAttempt.userId !== user.id && user.role !== "admin")
    ) {
      router.push("/dashboard/history");
      return;
    }

    setAttempt(quizAttempt);

    const relatedQuiz = getQuizById(quizAttempt.quizId);
    if (relatedQuiz) {
      setQuiz(relatedQuiz);

      const allQuestions = getQuestions();
      const quizQuestions = allQuestions.filter((q) =>
        relatedQuiz.questionIds.includes(q.id)
      );

      setQuestions(quizQuestions);
    }

    setLoading(false);
  }, [attemptId, user, getQuizAttemptById, getQuizById, getQuestions, router]);

  if (!user || !attempt || !quiz || loading) {
    return (
      <Card loading={true}>
        <div style={{ height: "300px" }} />
      </Card>
    );
  }

  const formatDuration = () => {
    if (!attempt.completedAt) return "In progress";
    const start = new Date(attempt.startedAt).getTime();
    const end = new Date(attempt.completedAt).getTime();
    const diffInSeconds = Math.floor((end - start) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;

    return `${minutes}m ${seconds}s`;
  };

  const calculateCorrectAnswers = () => {
    if (!attempt.answers || !questions.length) return 0;

    let correct = 0;
    attempt.answers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (question && answer.answerId === question.correctAnswer) {
        correct++;
      }
    });

    return correct;
  };

  const correctAnswers = calculateCorrectAnswers();
  const totalQuestions = questions.length;
  const scorePercentage = attempt.score ?? 0;

  return (
    <div className="quiz-attempt-detail">
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Link href="/dashboard/history">
              <Button icon={<LeftOutlined />} type="text">
                Back to History
              </Button>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2}>{quiz.title}</Title>
          </div>

          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Descriptions
                title="Attempt Information"
                bordered
                column={{ xs: 1, sm: 2, md: 3 }}
              >
                {user.role === "admin" && (
                  <Descriptions.Item label="User">
                    {users.find((u) => u.id === attempt.userId)?.username}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Date">
                  {new Date(attempt.startedAt).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Time">
                  {new Date(attempt.startedAt).toLocaleTimeString()}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {attempt.completedAt ? (
                    <Tag color="green">Completed</Tag>
                  ) : (
                    <Tag color="blue">In Progress</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  <ClockCircleOutlined /> {formatDuration()}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Score"
                  span={user.role === "admin" ? 1 : 2}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <TrophyOutlined style={{ marginRight: "8px" }} />
                    <Progress
                      percent={scorePercentage}
                      size="small"
                      status={scorePercentage >= 60 ? "success" : "exception"}
                      style={{ width: "200px", marginRight: "16px" }}
                    />
                    <Text strong>{scorePercentage}%</Text>
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Title level={4}>Question Summary</Title>
              <Text type="secondary">
                {correctAnswers} correct out of {totalQuestions} questions
              </Text>

              <List
                itemLayout="vertical"
                dataSource={questions}
                renderItem={(question, index) => {
                  const questionAnswers = attempt.answers.filter(
                    (a) => a.questionId === question.id
                  );
                  const userAnswer =
                    questionAnswers.length > 0
                      ? questionAnswers[0].answerId
                      : undefined;
                  const isCorrect = userAnswer === question.correctAnswer;

                  return (
                    <List.Item>
                      <Card
                        size="small"
                        title={`Question ${index + 1}`}
                        extra={
                          userAnswer ? (
                            isCorrect ? (
                              <Tag color="success" icon={<CheckCircleFilled />}>
                                Correct
                              </Tag>
                            ) : (
                              <Tag color="error" icon={<CloseCircleFilled />}>
                                Incorrect
                              </Tag>
                            )
                          ) : (
                            <Tag color="default">Not answered</Tag>
                          )
                        }
                      >
                        <Paragraph>{question.text}</Paragraph>

                        <div style={{ marginTop: "12px" }}>
                          {question.options.map((option, i) => (
                            <div
                              key={i}
                              style={{
                                padding: "8px",
                                marginBottom: "8px",
                                borderRadius: "4px",
                                background:
                                  userAnswer === option
                                    ? isCorrect
                                      ? "#f6ffed"
                                      : "#fff2f0"
                                    : question.correctAnswer === option
                                    ? "#f6ffed"
                                    : "transparent",
                                border:
                                  userAnswer === option ||
                                  question.correctAnswer === option
                                    ? `1px solid ${
                                        userAnswer === option
                                          ? isCorrect
                                            ? "#b7eb8f"
                                            : "#ffccc7"
                                          : "#b7eb8f"
                                      }`
                                    : "1px solid #f0f0f0",
                              }}
                            >
                              {option}
                              {question.correctAnswer === option && (
                                <CheckCircleFilled
                                  style={{
                                    color: "#52c41a",
                                    marginLeft: "8px",
                                  }}
                                />
                              )}
                              {userAnswer === option &&
                                userAnswer !== question.correctAnswer && (
                                  <CloseCircleFilled
                                    style={{
                                      color: "#ff4d4f",
                                      marginLeft: "8px",
                                    }}
                                  />
                                )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </Space>
          </Card>
        </Space>
      </Card>
    </div>
  );
}
