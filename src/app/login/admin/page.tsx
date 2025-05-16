"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

// Add this interface at the top of the file
interface LoginError {
  message: string;
  status?: number;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isAuthenticated, userRole, isLoading } = useAuth();

  // Redirect if already authenticated with ADMIN role
  useEffect(() => {
    if (isAuthenticated && userRole === "ADMIN") {
      router.push("/admin");
    }
  }, [isAuthenticated, userRole, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password, "ADMIN");
      toast.success("Welcome back, Administrator!");
    } catch (error: unknown) {
      // Type guard to check if error is LoginError
      const loginError = error as LoginError;
      console.error('Login error:', loginError);
      setError(loginError.message || "Invalid credentials");
      toast.error(loginError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-xl font-semibold text-gray-700">Checking Authentication</h2>
          <p className="text-gray-500">Verifying your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full items-center h-screen bg-gray-100">
      <Card className="w-full max-w-lg px-6 py-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          {/* Replace with your actual logo */}
          <div className="relative w-40 h-20">
            <Image
              src="/truck.svg" 
              alt="Company Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Admin Portal
          </CardTitle>
          <p className="text-center text-gray-500">Sign in to your dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <p className="text-red-500 text-center text-sm">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="py-2 px-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="py-2 px-3"
              />
            </div>
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}