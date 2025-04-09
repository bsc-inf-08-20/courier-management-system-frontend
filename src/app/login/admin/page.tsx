"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now() && payload.role === "ADMIN") {
          router.push("/admin");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      toast.success("Logged in successfully");
      router.push("/admin");
    } catch {
      setLoading(false);
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <div className="flex justify-center w-full items-center h-screen bg-gray-100">
      <Card className="w-full max-w-lg px-6 py-8 bg-white rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Admin Login
          </CardTitle>
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
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}