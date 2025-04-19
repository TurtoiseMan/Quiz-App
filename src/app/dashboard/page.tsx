"use client";

import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import { useEffect, useState } from "react";
import { Quiz, Question, QuizAttempt } from "@/types";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Alert,
  Typography,
  Divider,
  Space,
  Checkbox,
  Tag,
  List,
  Row,
  Col,
  Modal,
  Badge,
  Tooltip,
} from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
interface QuizFormValues {
  title: string;
  description: string;
  timeLimit: number;
  questions: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const getQuizzes = useQuizStore((state) => state.getQuizzes);
  const createQuiz = useQuizStore((state) => state.createQuiz);
  const updateQuiz = useQuizStore((state) => state.updateQuiz);
  const deleteQuiz = useQuizStore((state) => state.deleteQuiz);
  const getQuestions = useQuizStore((state) => state.getQuestions);

  const getQuizAttemptsByUser = useQuizStore(
    (state) => state.getQuizAttemptsByUser
  );
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
  const [form] = Form.useForm();

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
    form.resetFields();
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setTitle(quiz.title);
    setDescription(quiz.description);
    setTimeLimit(quiz.timeLimit);
    setSelectedQuestionIds([...quiz.questionIds]);
    setError("");
    setIsCreatingQuiz(false);
    setEditingQuizId(quiz.id);
    form.setFieldsValue({
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      questions: quiz.questionIds,
    });
  };

  const handleDeleteQuiz = (quizId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this quiz?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        const success = deleteQuiz(quizId);
        if (success) {
          setQuizzes(getQuizzes());
        }
      },
    });
  };

  // const toggleQuestionSelection = (questionId: string) => {
  //   setSelectedQuestionIds((prev) => {
  //     if (prev.includes(questionId)) {
  //       return prev.filter((id) => id !== questionId);
  //     } else {
  //       return [...prev, questionId];
  //     }
  //   });
  // };

  const handleSubmitQuiz = (values: QuizFormValues) => {
    try {
      if (editingQuizId) {
        updateQuiz(
          editingQuizId,
          values.title,
          values.description,
          values.timeLimit,
          values.questions || []
        );
      } else if (user) {
        createQuiz(
          values.title,
          values.description,
          values.timeLimit,
          values.questions || [],
          user.id
        );
      }

      setTitle("");
      setDescription("");
      setTimeLimit(30);
      setSelectedQuestionIds([]);
      setIsCreatingQuiz(false);
      setEditingQuizId(null);
      setError("");
      form.resetFields();
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
    form.resetFields();
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
    return quizzes.find((quiz) => quiz.id === quizId);
  };

  return (
    <Card className="dashboard-container">
      <Title level={2}>Dashboard</Title>

      {isAdmin() ? (
        <div>
          <Card type="inner" className="mb-6">
            <Title level={3}>Admin Dashboard</Title>
            <Paragraph>
              Welcome {user.username}! You have access to manage questions and
              view all answers.
            </Paragraph>
          </Card>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <Title level={3}>Manage Quizzes</Title>
              {!isCreatingQuiz && !editingQuizId && (
                <Button type="primary" onClick={handleCreateQuiz}>
                  Create New Quiz
                </Button>
              )}
            </div>

            {(isCreatingQuiz || editingQuizId) && (
              <Card className="mb-6">
                <Title level={4}>
                  {editingQuizId ? "Edit Quiz" : "Create New Quiz"}
                </Title>

                {error && (
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="mb-4"
                  />
                )}

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmitQuiz}
                  initialValues={{
                    title,
                    description,
                    timeLimit,
                    questions: selectedQuestionIds,
                  }}
                >
                  <Form.Item
                    label="Quiz Title"
                    name="title"
                    rules={[
                      { required: true, message: "Please enter quiz title" },
                    ]}
                  >
                    <Input placeholder="Enter quiz title..." />
                  </Form.Item>

                  <Form.Item
                    label="Quiz Description"
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: "Please enter quiz description",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Enter quiz description..."
                    />
                  </Form.Item>

                  <Form.Item
                    label="Time Limit (minutes)"
                    name="timeLimit"
                    rules={[
                      { required: true, message: "Please enter time limit" },
                      {
                        type: "number",
                        min: 1,
                        message: "Time must be greater than 0",
                      },
                    ]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    label="Select Questions"
                    name="questions"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one question",
                      },
                    ]}
                  >
                    <>
                      {questions.length === 0 ? (
                        <Alert
                          message="No questions available. Please create questions first."
                          type="info"
                          showIcon
                        />
                      ) : (
                        <Checkbox.Group style={{ width: "100%" }}>
                          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                            <List
                              dataSource={questions}
                              renderItem={(question) => (
                                <List.Item>
                                  <Checkbox value={question.id}>
                                    {question.text}
                                  </Checkbox>
                                </List.Item>
                              )}
                            />
                          </div>
                        </Checkbox.Group>
                      )}
                    </>
                  </Form.Item>

                  <Form.Item>
                    <Text type="secondary" className="block mt-1">
                      {form.getFieldValue("questions")?.length || 0} question(s)
                      selected
                    </Text>
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button onClick={handleCancel}>Cancel</Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={questions.length === 0}
                      >
                        {editingQuizId ? "Update" : "Create"} Quiz
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            )}

            {!isCreatingQuiz && !editingQuizId && quizzes.length === 0 ? (
              <Alert
                message="No quizzes available yet. Click 'Create New Quiz' to create one."
                type="info"
                showIcon
              />
            ) : (
              !isCreatingQuiz &&
              !editingQuizId && (
                <List
                  itemLayout="vertical"
                  dataSource={quizzes}
                  renderItem={(quiz) => (
                    <List.Item
                      key={quiz.id}
                      actions={[
                        <Button
                          key="edit"
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => handleEditQuiz(quiz)}
                        >
                          Edit
                        </Button>,
                        <Button
                          key="delete"
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteQuiz(quiz.id)}
                        >
                          Delete
                        </Button>,
                      ]}
                    >
                      <Card>
                        <List.Item.Meta
                          title={quiz.title}
                          description={quiz.description}
                        />
                        <div className="mt-3">
                          <Space>
                            <Tag icon={<ClockCircleOutlined />} color="blue">
                              {quiz.timeLimit} minutes
                            </Tag>
                            <Tag
                              icon={<QuestionCircleOutlined />}
                              color="green"
                            >
                              {quiz.questionIds.length} questions
                            </Tag>
                          </Space>
                          <div>
                            <Text
                              type="secondary"
                              className="text-xs mt-2 block"
                            >
                              Created:{" "}
                              {new Date(quiz.createdAt).toLocaleString()}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              )
            )}
          </div>
        </div>
      ) : (
        <div>
          <Card
            type="inner"
            className="mb-6"
            style={{ backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}
          >
            <Title level={3}>Student Dashboard</Title>
            <Paragraph>
              Welcome {user.username}! Here you can take quizzes and view your
              past results.
            </Paragraph>
          </Card>

          <div className="mb-8">
            <Title level={4}>Your Quiz Attempts</Title>

            {quizAttempts.length === 0 ? (
              <Alert
                message="You haven't attempted any quizzes yet."
                type="info"
                showIcon
              />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={quizAttempts}
                renderItem={(attempt) => {
                  const quiz = getQuizById(attempt.quizId);
                  if (!quiz) return null;

                  return (
                    <List.Item
                      key={attempt.id}
                      actions={
                        attempt.completedAt
                          ? [
                              <Tag key={`score-${attempt.id}`} color="blue">
                                Score:{" "}
                                {attempt.score !== undefined
                                  ? `${attempt.score}%`
                                  : "N/A"}
                              </Tag>,
                            ]
                          : [
                              <Tag key={`timer-${attempt.id}`} color="orange">
                                {calculateTimeRemaining(quiz, attempt)}
                              </Tag>,
                              <Button
                                key={`continue-${attempt.id}`}
                                type="primary"
                                size="small"
                                href={`/dashboard/questions?attemptId=${attempt.id}`}
                              >
                                Continue
                              </Button>,
                            ]
                      }
                    >
                      <List.Item.Meta
                        title={quiz.title}
                        description={
                          <div>
                            <Text>
                              Started:{" "}
                              {new Date(attempt.startedAt).toLocaleString()}
                            </Text>
                            {attempt.completedAt && (
                              <div>
                                <Text type="secondary">
                                  Completed:{" "}
                                  {new Date(
                                    attempt.completedAt
                                  ).toLocaleString()}
                                </Text>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </div>

          <div>
            <Title level={4}>Available Quizzes</Title>

            {quizzes.length === 0 ? (
              <Alert
                message="No quizzes are available right now. Check back later!"
                type="info"
                showIcon
              />
            ) : (
              <Row gutter={[16, 16]}>
                {quizzes.map((quiz) => {
                  const hasCompletedAttempt = quizAttempts.some(
                    (attempt) =>
                      attempt.quizId === quiz.id && attempt.completedAt
                  );

                  const inProgressAttempt = quizAttempts.find(
                    (attempt) =>
                      attempt.quizId === quiz.id && !attempt.completedAt
                  );

                  return (
                    <Col xs={24} sm={12} key={quiz.id}>
                      <Card
                        hoverable
                        title={quiz.title}
                        extra={
                          <Space>
                            <Tooltip title="Questions">
                              <Badge
                                count={quiz.questionIds.length}
                                color="blue"
                              />
                            </Tooltip>
                            <Tooltip title="Minutes">
                              <Badge count={quiz.timeLimit} color="green" />
                            </Tooltip>
                          </Space>
                        }
                      >
                        <Paragraph>{quiz.description}</Paragraph>

                        <Divider />

                        {inProgressAttempt ? (
                          <Button
                            type="primary"
                            block
                            href={`/dashboard/questions?attemptId=${inProgressAttempt.id}`}
                            style={{ backgroundColor: "#faad14" }}
                          >
                            Continue Quiz
                          </Button>
                        ) : hasCompletedAttempt ? (
                          <div className="flex justify-between items-center">
                            <Text type="secondary">Already completed</Text>
                            <Button onClick={() => handleStartQuiz(quiz.id)}>
                              Try Again
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="primary"
                            block
                            icon={<RightCircleOutlined />}
                            onClick={() => handleStartQuiz(quiz.id)}
                          >
                            Start Quiz
                          </Button>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
