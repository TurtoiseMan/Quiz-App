"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useQuizStore } from "@/store/quizStore";
import Navbar from "@/components/Navbar";
import { Layout, Spin } from "antd";

const { Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, logout } = useAuthStore();
  const initializeStore = useQuizStore((state) => state.initializeStore);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHydrated(true);
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (!hydrated) return;

    const checkAccess = async () => {
      if (!user) {
        router.push("/signin");
        return;
      }

      // if (pathname.includes("/questions") && !isAdmin()) {
      //   router.push("/dashboard");
      //   return;
      // }

      setLoading(false);
    };

    checkAccess();
  }, [user, isAdmin, router, pathname, hydrated]);

  const handleSignOut = () => {
    logout();
    router.push("/signin");
  };

  if (!hydrated || loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar user={user} onSignOut={handleSignOut} />
      <Content style={{ background: "#f5f5f5", padding: "24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>{children}</div>
      </Content>
    </Layout>
  );
}
