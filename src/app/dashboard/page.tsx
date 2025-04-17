'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '@/data/storageService';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
    } else {
      setUser(currentUser);
      setLoading(false);
    }
  }, [router]);

  const handleSignOut = () => {
    logout();
    router.push('/signin');
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-black">Dashboard</h1>

        {user?.role === 'admin' ? (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-black">Admin Dashboard</h2>
            <p className="text-black">
              Welcome admin! You have access to manage questions and view all answers.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-black">User Dashboard</h2>
            <p className="text-black">
              Welcome user! You can answer questions and view/edit your responses.
            </p>
          </div>
        )}
        
        <button
          onClick={handleSignOut}
          className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}