"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useEffect, useState } from "react";
import { Question, Quiz, QuizAttempt } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Typography,
  Button,
  Card,
  Space,
  Form,
  Input,
  Select,
  Alert,
  Radio,
  Steps,
  Progress,
  Divider,
  Tag,
  Result,
  message,
  Spin,
  Statistic,
  Popconfirm,
  List,
} from "antd";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { Countdown } = Statistic;

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
  const [form] = Form.useForm();

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
      <Card>
        <Alert
          message="Access Denied"
          description="You need admin privileges to manage questions."
          type="error"
          showIcon
        />
      </Card>
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
      message.success("Quiz submitted successfully!");
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAddQuestion = () => {
    form.resetFields();
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setError("");
    setIsAddingQuestion(true);
    setEditingQuestionId(null);
  };

  const handleEditQuestion = (question: Question) => {
    form.setFieldsValue({
      questionText: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
    });
    setQuestionText(question.text);
    setOptions([...question.options]);
    setCorrectAnswer(question.correctAnswer);
    setError("");
    setIsAddingQuestion(false);
    setEditingQuestionId(question.id);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const success = deleteQuestion(questionId);
    if (success) {
      setQuestions(getQuestions());
      message.success("Question deleted successfully!");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmitQuestion = (values: any) => {
    const { questionText, options, correctAnswer } = values;

    try {
      if (editingQuestionId) {
        updateQuestion(editingQuestionId, questionText, options, correctAnswer);
        setQuestions(getQuestions());
        message.success("Question updated successfully!");
      } else if (user) {
        const newQuestion = addQuestion(questionText, user.id);
        updateQuestion(newQuestion.id, questionText, options, correctAnswer);
        setQuestions(getQuestions());
        message.success("Question added successfully!");
      }

      form.resetFields();
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
    form.resetFields();
  };

  if (attemptId) {
    if (error) {
      return (
        <Card>
          <Alert message="Error" description={error} type="error" showIcon />
          <Button
            type="primary"
            onClick={() => router.push("/dashboard")}
            style={{ marginTop: 16 }}
          >
            Back to Dashboard
          </Button>
        </Card>
      );
    }

    if (isQuizCompleted) {
      return (
        <Card>
          <Result
            status="success"
            title="Quiz Completed!"
            subTitle={currentQuiz?.title}
            extra={[
              <Button
                key="back"
                type="primary"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>,
            ]}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={4}>Your Score: {quizScore}%</Title>
              <Progress
                type="circle"
                percent={quizScore || 0}
                status={quizScore && quizScore >= 60 ? "success" : "exception"}
              />
            </div>

            <Divider>Question Review</Divider>

            <List
              itemLayout="vertical"
              dataSource={quizQuestions}
              renderItem={(question, index) => {
                const userAnswer = selectedAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <List.Item>
                    <Card
                      size="small"
                      title={
                        <Space>
                          <Tag color="blue">{index + 1}</Tag>
                          <Text strong>{question.text}</Text>
                        </Space>
                      }
                    >
                      <List
                        dataSource={question.options}
                        renderItem={(option) => {
                          let color = "";
                          let icon = null;

                          if (option === question.correctAnswer) {
                            color = "success";
                            icon = "✓";
                          } else if (
                            option === userAnswer &&
                            option !== question.correctAnswer
                          ) {
                            color = "error";
                            icon = "✗";
                          }

                          return (
                            <List.Item>
                              <Radio checked={userAnswer === option} disabled>
                                <Space>
                                  <Text>{option}</Text>
                                  {color && <Tag color={color}>{icon}</Tag>}
                                </Space>
                              </Radio>
                            </List.Item>
                          );
                        }}
                      />

                      <Alert
                        style={{ marginTop: 8 }}
                        message={isCorrect ? "Correct!" : "Incorrect!"}
                        type={isCorrect ? "success" : "error"}
                        showIcon
                      />
                    </Card>
                  </List.Item>
                );
              }}
            />
          </Result>
        </Card>
      );
    }

    if (!currentQuiz || quizQuestions.length === 0) {
      return (
        <Card>
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16 }}>
              Loading quiz questions...
            </Paragraph>
          </div>
        </Card>
      );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Title level={3}>{currentQuiz.title}</Title>
            <Countdown
              title="Time Remaining"
              value={Date.now() + timeRemaining * 1000}
              format="mm:ss"
              onFinish={handleSubmitQuiz}
              valueStyle={{ color: timeRemaining < 60 ? "#ff4d4f" : undefined }}
            />
          </Space>

          <Steps
            current={currentQuestionIndex}
            onChange={setCurrentQuestionIndex}
            size="small"
            style={{ marginBottom: 16 }}
            items={quizQuestions.map((_, index) => ({
              title: `Q${index + 1}`,
              status: selectedAnswers[quizQuestions[index].id]
                ? "finish"
                : index === currentQuestionIndex
                ? "process"
                : "wait",
            }))}
          />

          <Card>
            <Title level={5}>
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </Title>
            <Paragraph strong>{currentQuestion.text}</Paragraph>

            <Radio.Group
              onChange={(e) =>
                handleAnswerSelect(currentQuestion.id, e.target.value)
              }
              value={selectedAnswers[currentQuestion.id]}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {currentQuestion.options.map((option, index) => (
                  <Radio key={index} value={option} style={{ marginBottom: 8 }}>
                    <Card
                      hoverable
                      size="small"
                      style={{
                        width: "100%",
                        borderColor:
                          selectedAnswers[currentQuestion.id] === option
                            ? "#1890ff"
                            : undefined,
                      }}
                    >
                      <Space>
                        <Text>{String.fromCharCode(65 + index)}</Text>
                        <Text>{option}</Text>
                      </Space>
                    </Card>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>

          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            {currentQuestionIndex < quizQuestions.length - 1 ? (
              <Button type="primary" onClick={handleNextQuestion}>
                Next
              </Button>
            ) : (
              <Button type="primary" danger onClick={handleSubmitQuiz}>
                Submit Quiz
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={3}>Manage Questions</Title>
          {!isAddingQuestion && !editingQuestionId && (
            <Button type="primary" onClick={handleAddQuestion}>
              Add New Question
            </Button>
          )}
        </Space>

        {(isAddingQuestion || editingQuestionId) && (
          <Card
            title={editingQuestionId ? "Edit Question" : "Add New Question"}
          >
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitQuestion}
              initialValues={{
                questionText,
                options,
                correctAnswer,
              }}
            >
              <Form.Item
                name="questionText"
                label="Question Text"
                rules={[
                  { required: true, message: "Please enter the question text" },
                ]}
              >
                <TextArea rows={3} placeholder="Enter the question text..." />
              </Form.Item>

              <Form.List name="options">
                {(fields) => (
                  <>
                    {fields.map((field, index) => (
                      <Form.Item
                        label={`Option ${String.fromCharCode(65 + index)}`}
                        key={field.key}
                        name={[field.name]}
                        rules={[
                          { required: true, message: "Option cannot be empty" },
                        ]}
                      >
                        <Input
                          placeholder={`Enter option ${String.fromCharCode(
                            65 + index
                          )}...`}
                        />
                      </Form.Item>
                    ))}
                  </>
                )}
              </Form.List>

              <Form.Item
                name="correctAnswer"
                label="Correct Answer"
                rules={[
                  {
                    required: true,
                    message: "Please select the correct answer",
                  },
                ]}
              >
                <Select placeholder="Select the correct answer...">
                  {options.map((option, index) => (
                    <Select.Option
                      key={index}
                      value={option}
                      disabled={!option}
                    >
                      {option || `Option ${String.fromCharCode(65 + index)}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingQuestionId ? "Update Question" : "Add Question"}
                  </Button>
                  <Button onClick={handleCancel}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}

        <List
          dataSource={questions}
          renderItem={(question) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="link"
                  onClick={() => handleEditQuestion(question)}
                >
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete this question?"
                  description="Are you sure you want to delete this question?"
                  onConfirm={() => handleDeleteQuestion(question.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={question.text}
                description={
                  <Space direction="vertical">
                    {question.options.map((option, index) => (
                      <Space key={index}>
                        <Tag
                          color={
                            option === question.correctAnswer
                              ? "green"
                              : undefined
                          }
                        >
                          {String.fromCharCode(65 + index)}
                        </Tag>
                        <Text>{option}</Text>
                        {option === question.correctAnswer && (
                          <Tag color="success">Correct</Tag>
                        )}
                      </Space>
                    ))}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
}
