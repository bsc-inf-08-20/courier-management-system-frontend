"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link for navigation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AgentLoginPage() {
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
        if (payload.exp * 1000 > Date.now() && payload.role === "AGENT") {
          router.push("/agent");
        }
      } catch (error) {
        console.log(error);
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

      // Store token
      localStorage.setItem("token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      toast.success("Logged in successfully");
      router.push("/agent_components");
    } catch (err) {
      console.log(err);
      setLoading(false);
      setError("Something went wrong, please try again.");
    }
  };

  //     // Decode token to check role
  //     const payload = JSON.parse(atob(data.access_token.split(".")[1]));
  //     if (payload.role !== "AGENT") {
  //       setError("Unauthorized access");
  //       localStorage.removeItem("token");
  //       return;
  //     }

  //     // Redirect to agent dashboard
  //     router.push("/agent");
  //   } catch (err) {
  //     setLoading(false);
  //     setError("Something went wrong, please try again.");
  //   }
  // };

  return (
    <div className="flex justify-center w-full items-center h-screen bg-gray-100">
      <Card className="w-full max-w-lg px-6 py-8 bg-white rounded-lg shadow-md">
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
            Do not have an agent account?{" "}
            <Link
              href="/agent_auth/registration"
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
