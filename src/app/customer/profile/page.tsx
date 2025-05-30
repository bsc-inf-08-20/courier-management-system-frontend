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
    city: string;
    area: string;
  }>({
    name: decodedToken?.name?.toString() || "",
    email: decodedToken?.email?.toString() || "",
    phone: decodedToken?.phone?.toString() ||"",
    city:  decodedToken?.city?.toString() ||"",
    area:  decodedToken?.area?.toString() ||"",
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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/me`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    const result = await response.json();
    console.log("Profile updated:", result);
    alert("Profile updated successfully!");

  } catch (error) {
    console.error("Update error:", error);
    alert("An error occurred while updating your profile.");
  }
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
              <label className="block text-sm font-medium text-gray-700">City</label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Area</label>
              <Input
                name="area"
                value={formData.area}
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
