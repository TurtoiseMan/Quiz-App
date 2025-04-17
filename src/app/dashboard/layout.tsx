"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/data/storageService";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/signin");
    } else if (
      pathname.includes("/questions") &&
      currentUser.role !== "admin"
    ) {
      router.push("/dashboard");
    } else {
      setUser(currentUser);
      setLoading(false);
    }
  }, [router, pathname]);

  const handleSignOut = () => {
    logout();
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
