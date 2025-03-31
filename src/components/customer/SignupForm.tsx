import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabsContent } from "@/components/ui/tabs";

export default function SignupForm() {
  const [signupData, setSignupData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.phone || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    // For UI purposes, log the data and clear the form
    console.log("Sign-up data:", signupData);
    setSignupData({ name: "", phone: "", email: "", password: "", confirmPassword: "" });
    setError("");
  };

  return (
    <TabsContent value="signup">
      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          placeholder="Full Name"
          value={signupData.name}
          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
        />
        <Input
          placeholder="Phone Number"
          value={signupData.phone}
          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
        />
        <Input
          type="email"
          placeholder="Email Address"
          value={signupData.email}
          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
        />
        <Input
          type="password"
          placeholder="Password"
          value={signupData.password}
          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={signupData.confirmPassword}
          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
    </TabsContent>
  );
}