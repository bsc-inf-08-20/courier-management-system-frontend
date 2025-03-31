"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupForm from "@/components/customer/SignupForm";
import LoginForm from "@/components/customer/LoginForm";

export default function Auth() {
  return (
    <div className="min-h-screen min-w-full bg-gray-100 flex justify-center items-center">
      <main className="w-full max-w-lg px-6 py-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome Customer
        </h2>
        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="login" className="px-4 py-2">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="px-4 py-2">
              Sign Up
            </TabsTrigger>
          </TabsList>
          <LoginForm />
          <SignupForm />
        </Tabs>
      </main>
    </div>
  );
}
