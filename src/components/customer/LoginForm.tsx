import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabsContent } from "@/components/ui/tabs";
import Link from "next/link";

export default function LoginForm() {
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.identifier || !loginData.password) {
      setError("Please fill in all fields");
      return;
    }
    // For UI purposes, log the data and clear the form
    console.log("Login data:", loginData);
    setLoginData({ identifier: "", password: "" });
    setError("");
  };

  return (
    <TabsContent value="login">
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          placeholder="Email or Phone Number"
          value={loginData.identifier}
          onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
        />
        <Input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </TabsContent>
  );
}