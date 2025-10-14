'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for auth state to load
    }

    if (!user) {
      // Not logged in
      router.push('/signin');
      return;
    }

    if (user.role === 'banned') {
      // Banned user
      router.push('/signin'); // Or a specific banned page
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Insufficient role
      router.push('/'); // Redirect to homepage or an access denied page
      return;
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    // Optionally render a loading spinner or a minimal layout while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải hoặc chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
