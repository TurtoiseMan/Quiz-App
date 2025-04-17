"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types";

interface NavbarProps {
  user: User;
  onSignOut: () => void;
}

export default function Navbar({ user, onSignOut }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? "bg-gray-100" : "";
  };

  return (
    <nav className="bg-white shadow w-full mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Quiz App</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 ${isActive(
                  "/dashboard"
                )}`}
              >
                Dashboard
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/dashboard/questions"
                  className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 ${isActive(
                    "/dashboard/questions"
                  )}`}
                >
                  Questions
                </Link>
              )}

              <Link
                href="/dashboard/answers"
                className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 ${isActive(
                  "/dashboard/answers"
                )}`}
              >
                Answers
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-4">
                {user.username} ({user.role})
              </span>
              <button
                onClick={onSignOut}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
