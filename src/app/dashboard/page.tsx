"use client";

import { User } from "@/types";
import { getCurrentUser } from "@/data/storageService";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Dashboard</h1>

      {user.role === "admin" ? (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-black">
            Admin Dashboard
          </h2>
          <p className="text-black">
            Welcome admin! You have access to manage questions and view all
            answers.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-black">
            User Dashboard
          </h2>
          <p className="text-black">
            Welcome user! You can answer questions and view/edit your responses.
          </p>
        </div>
      )}
    </div>
  );
}
