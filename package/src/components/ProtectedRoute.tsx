'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'guest';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
  redirectTo = '/signin'
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Nếu chưa đăng nhập
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Kiểm tra role
      if (requiredRole === 'admin' && user.role !== 'admin') {
        router.push('/');
        return;
      }

      if (requiredRole === 'user' && user.role === 'guest') {
        router.push(redirectTo);
        return;
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không có quyền
  if (!user || 
      (requiredRole === 'admin' && user.role !== 'admin') ||
      (requiredRole === 'user' && user.role === 'guest')) {
    return null;
  }

  // Nếu có quyền, hiển thị nội dung
  return <>{children}</>;
};

