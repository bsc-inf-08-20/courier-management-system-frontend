"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link for navigation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function AgentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isAuthenticated, userRole, isLoading } = useAuth("AGENT");

  useEffect(() => {
    if (isAuthenticated && userRole === "AGENT") {
      router.push("/agent");
    }
  }, [isAuthenticated, userRole, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password, "AGENT");
      toast.success("Welcome back, Agent!");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Invalid credentials");
      toast.error(error.message || "Login failed");
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
          <h2 className="text-xl font-semibold text-gray-700">
            Checking Authentication
          </h2>
          <p className="text-gray-500">Verifying your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full items-center h-screen bg-gray-100">
      <Card className="w-full max-w-lg px-6 py-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
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
          <CardTitle className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Agent Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <p className="text-red-500 text-center text-sm">{error}</p>
            )}
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Link to agent application form */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an agent account?{" "}
            <Link
              href="/agent-auth/registration"
              className="text-blue-600 font-semibold hover:underline"
            >
              Apply to be an Agent
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
