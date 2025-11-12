'use client';

import { useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser } from '../lib/api-client';
import { LoginPage } from '../components/LoginPage';
import { TeacherDashboard } from '../components/TeacherDashboard';
import { StudentDashboard } from '../components/StudentDashboard';
import { Toaster } from '../components/ui/sonner';

export default function Home() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUserState(user);
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {currentUser.role === 'teacher' ? (
        <TeacherDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <StudentDashboard user={currentUser} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}