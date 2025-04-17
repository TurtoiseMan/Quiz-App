"use client";

import { useAuthStore } from "@/store/authStore";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Dashboard</h1>

      {isAdmin() ? (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-black">
            Admin Dashboard
          </h2>
          <p className="text-black">
            Welcome {user.username}! You have access to manage questions and
            view all answers.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-black">
            User Dashboard
          </h2>
          <p className="text-black">
            Welcome {user.username}! You can answer questions and view/edit your
            responses.
          </p>
        </div>
      )}
    </div>
  );
}
