"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Avatar,
  Space,
  Dropdown,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Header } = Layout;
const { Text } = Typography;

interface NavbarProps {
  user: User;
  onSignOut: () => void;
}

export default function Navbar({ user, onSignOut }: NavbarProps) {
  const pathname = usePathname();

  const items: MenuProps["items"] = [
    {
      key: "/dashboard",
      label: <Link href="/dashboard">Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
    user.role === "admin"
      ? {
          key: "/dashboard/questions",
          label: <Link href="/dashboard/questions">Questions</Link>,
          icon: <QuestionCircleOutlined />,
        }
      : null,
    {
      key: "/dashboard/history",
      label: <Link href="/dashboard/history">History</Link>,
      icon: <FileTextOutlined />,
    },
  ].filter(Boolean);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <Space>
          <UserOutlined />
          <span>
            {user.username} ({user.role})
          </span>
        </Space>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "signout",
      danger: true,
      label: "Sign Out",
      icon: <LogoutOutlined />,
      onClick: onSignOut,
    },
  ];

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 auto",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10%" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            href="/dashboard"
            style={{ textDecoration: "none", marginRight: 40 }}
          >
            <Typography.Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              Quiz App
            </Typography.Title>
          </Link>

          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            style={{ border: "none", minWidth: 400 }}
            items={items}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <Text strong>{user.username}</Text>
            </Space>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
}
