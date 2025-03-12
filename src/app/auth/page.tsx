'use client'
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.phone || !loginData.password) {
      setError("Please fill in all fields");
      return;
    }
    console.log("Login:", loginData);
    // Add API call here
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    console.log("Sign Up:", signupData);
    // Add API call here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-md mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome</h2>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input placeholder="Phone Number" value={loginData.phone} onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })} />
              <Input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Login</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <Input placeholder="Full Name" value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} />
              <Input placeholder="Phone Number" value={signupData.phone} onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })} />
              <Input type="password" placeholder="Password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
              <Input type="password" placeholder="Confirm Password" value={signupData.confirmPassword} onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })} />
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Sign Up</Button>
            </form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}