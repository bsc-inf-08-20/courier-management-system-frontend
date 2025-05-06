// /src/app/login/customer/page.tsx
"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupForm from "@/components/customer/SignupForm";
import LoginForm from "@/components/customer/LoginForm";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function Auth() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";

  return (
    <div className="min-h-screen min-w-full bg-gray-100 flex justify-center items-center">
      <main className="w-full max-w-lg px-6 py-8 bg-white rounded-lg shadow-md">
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
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome Customer
        </h2>
        <Tabs defaultValue={defaultTab} className="w-full">
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
