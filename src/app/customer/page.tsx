"use client";

import { useAuth } from "@/hooks/useAuth";

export default function CustomerDashboard() {
  const { isLoading } = useAuth("USER");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  );
}
