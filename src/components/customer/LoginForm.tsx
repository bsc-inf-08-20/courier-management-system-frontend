// /src/components/customer/LoginForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, userRole, isLoading: authLoading } = useAuth("USER");
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole === "USER") {
      router.push("/customer");
    }
  }, [isAuthenticated, userRole, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setIsLoading(true);
    
    try {
      await login(loginData.email, loginData.password, "USER");
      // Login function will handle redirection
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
      setLoginData(prev => ({ ...prev, password: "" }));
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <TabsContent value="login">
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          placeholder="Email or Phone Number"
          value={loginData.email}
          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </>
          ) : "Login"}
        </Button>
      </form>
    </TabsContent>
  );
}