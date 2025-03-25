"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        // Replace with your NestJS API
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

      // Store token
      localStorage.setItem("token", data.access_token);

      // Decode token to check role (optional but recommended)
      const payload = JSON.parse(atob(data.access_token.split(".")[1])); // Decode JWT payload
      if (payload.role !== "ADMIN") {
        setError("Unauthorized access");
        localStorage.removeItem("token");
        return;
      }

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err) {
      setLoading(false);
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <div className="flex justify-center w-full items-center h-screen bg-gray-100">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-center font-bold">Admin Login</CardTitle>
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
        </CardContent>
      </Card>
    </div>
  );
}
