"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../lib/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Optional: restrict to specific roles ('user', 'runner')
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
    
    if (!isLoading && isAuthenticated && allowedRoles && user) {
        if (!allowedRoles.includes(user.role)) {
             // Redirect to appropriate dashboard based on role or home
             if (user.role === 'runner') router.push('/runner-dashboard');
             else router.push('/dashboard');
        }
    }
  }, [isAuthenticated, isLoading, router, allowedRoles, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return null; // Will redirect
  }

  return <>{children}</>;
}
