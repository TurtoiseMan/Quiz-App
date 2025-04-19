"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, Table, Tag, Card, Space, Button } from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useQuizStore } from "@/store/quizStore";
import { useAuthStore } from "@/store/authStore";
import { QuizAttempt, Quiz } from "@/types";
import Link from "next/link";

const { Title, Text } = Typography;

export default function HistoryPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const getQuizAttempts = useQuizStore((state) => state.getQuizAttempts);
  const getQuizAttemptsByUser = useQuizStore(
    (state) => state.getQuizAttemptsByUser
  );
  const getQuizById = useQuizStore((state) => state.getQuizById);

  const [attempts, setAttempts] = useState<(QuizAttempt & { quiz?: Quiz })[]>(
    []
  );

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }

    const userAttempts = user.role =="user"? getQuizAttemptsByUser(user.id): getQuizAttempts();
    const attemptsWithQuiz = userAttempts.map((attempt) => {
      const quiz = getQuizById(attempt.quizId);
      return { ...attempt, quiz };
    });

    const sortedAttempts = attemptsWithQuiz.sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    setAttempts(sortedAttempts);
  }, [user, getQuizAttemptsByUser, getQuizAttempts, getQuizById, router]);

  if (!user) return null;

  const columns = [
    {
      title: "Quiz Title",
      dataIndex: "quiz",
      key: "quiz",
      render: (quiz?: Quiz) => (quiz ? quiz.title : "Unknown Quiz"),
    },
    {
      title: "Date",
      dataIndex: "startedAt",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      key: "status",
      render: (record: QuizAttempt) =>
        record.completedAt ? (
          <Tag color="green">Completed</Tag>
        ) : (
          <Tag color="blue">In Progress</Tag>
        ),
    },
    {
      title: "Score",
      key: "score",
      render: (record: QuizAttempt) =>
        record.score !== undefined ? (
          <Text strong>{record.score}%</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: QuizAttempt) => (
        <Link href={`/dashboard/history/${record.id}`}>
          <Button type="primary" size="small">
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="history-page">
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2}>
              <ClockCircleOutlined /> Quiz History
            </Title>
          </div>

          {attempts.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <FileTextOutlined style={{ fontSize: "48px", color: "#ccc" }} />
                <Title level={4}>No quizzes attempted yet</Title>
                <Text type="secondary">
                  Start taking quizzes to see your history here
                </Text>
                <div style={{ marginTop: "20px" }}>
                  <Link href="/dashboard/quizzes">
                    <Button type="primary">Find Quizzes</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Table
              dataSource={attempts}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
}
