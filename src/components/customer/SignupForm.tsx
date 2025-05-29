// /src/components/customer/SignupForm.tsx
"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabsContent } from "@/components/ui/tabs";

export default function SignupForm() {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    city: "",
    area: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      window.location.reload();
    }
    return () => clearTimeout(timer);
  }, [success, countdown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password ||
      !signupData.confirmPassword ||
      !signupData.phone_number ||
      !signupData.city ||
      !signupData.area
    ) {
      setError("Please fill in all fields");
      return;
    }
    
    if (!signupData.email.includes("@")) {
      setError("Invalid email format");
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone_number: signupData.phone_number,
          password: signupData.password,
          city: signupData.city,
          area: signupData.area,
          current_city: signupData.city,
          role: "USER",
          is_active: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      setSuccess(true);
      setCountdown(3);
      setSignupData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone_number: "",
        city: "",
        area: ""
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TabsContent value="signup">
      {success && (
        <Alert className="mb-4">
          <AlertDescription>
            Registration successful! Reloading in {countdown}...
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          placeholder="Full Name"
          value={signupData.name}
          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Email Address"
          value={signupData.email}
          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
          required
        />
        <Input
          placeholder="Phone Number"
          value={signupData.phone_number}
          onChange={(e) => setSignupData({ ...signupData, phone_number: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="City"
            value={signupData.city}
            onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
            required
          />
          <Input
            placeholder="Area"
            value={signupData.area}
            onChange={(e) => setSignupData({ ...signupData, area: e.target.value })}
            required
          />
        </div>
        <Input
          type="password"
          placeholder="Password"
          value={signupData.password}
          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={signupData.confirmPassword}
          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
          required
        />
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing up...
            </>
          ) : "Sign Up"}
        </Button>
      </form>
    </TabsContent>
  );
}