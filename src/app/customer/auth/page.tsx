'use client'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupForm from "@/components/customer/SignupForm";
import LoginForm from "@/components/customer/LoginForm";

export default function Auth() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow max-w-lg mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome</h2>
        <Tabs defaultValue="login" className="bg-white p-6 rounded-lg shadow-md">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="login" className="px-4 py-2">Login</TabsTrigger>
            <TabsTrigger value="signup" className="px-4 py-2">Sign Up</TabsTrigger>
          </TabsList>
          <LoginForm />
          <SignupForm />
        </Tabs>
      </main>
    </div>
  );
}