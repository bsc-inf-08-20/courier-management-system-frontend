"use client";

import { useEffect, ReactNode } from "react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole: UserRole;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, userRole, isLoading } = useAuth(requiredRole);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to appropriate login page
      switch (requiredRole) {
        case "ADMIN":
          router.push("/login/admin");
          break;
        case "AGENT":
          router.push("/login/agent");
          break;
        case "USER":
          router.push("/login/customer");
          break;
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center w-full items-center h-screen bg-gray-100">
        <div className="text-center space-y-4">
          <div className="inline-block relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <svg
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Authenticating</h2>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  // If authenticated with the correct role, render children
  if (isAuthenticated && userRole === requiredRole) {
    return <>{children}</>;
  }

  // Fallback - should not reach here due to the redirect in useEffect
  return null;
}