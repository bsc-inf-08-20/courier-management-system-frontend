"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthGuard from "@/components/AuthGuard"; // adjust path if needed
//import { UserRole } from "@/hooks/useAuth";

export default function Profile() {
  const { decodedToken } = useAuth("USER");
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
  }>({
    name: decodedToken?.name?.toString() || "",
    email: decodedToken?.email?.toString() || "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (decodedToken) {
      setFormData((prev) => ({
        ...prev,
        name: decodedToken.name?.toString() || "",
        email: decodedToken.email?.toString() || "",
      }));
    }
  }, [decodedToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile Updated:", formData);
    // TODO: Add API call to update profile
  };

  return (
    <AuthGuard requiredRole={"USER"}>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-2xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div className="text-right">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
