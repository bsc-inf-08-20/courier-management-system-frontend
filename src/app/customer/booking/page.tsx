'use client'
import Navbar from "@/components/customer/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Package, Truck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function Booking() {
  // Form state
  const [formData, setFormData] = useState({
    packageType: "",
    weight: "",
    instructions: "",
    pickupLocation: "",
    deliveryLocation: "",
    pickupOption: "agent" as "agent" | "hub",
    pickupTime: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.packageType) newErrors.packageType = "Package type is required";
    if (!formData.pickupLocation) newErrors.pickupLocation = "Pick-up location is required";
    if (!formData.deliveryLocation) newErrors.deliveryLocation = "Delivery location is required";
    if (formData.pickupOption === "agent" && !formData.pickupTime)
      newErrors.pickupTime = "Pick-up time is required";
    return newErrors;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("Booking Submitted:", formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-2xl mx-auto px-4 py-8 text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-6">Booking Confirmed!</h2>
          <p>Your booking ID is #12345. You’ll receive a confirmation soon.</p>
          <Link href="/tracking">
            <Button className="mt-4">Track Your Package</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar/>
      {/* Booking Form */}
      <main className="flex-grow max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Book a Courier</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-500" /> Package Details
            </h3>
            <Select
              onValueChange={(value) => handleChange("packageType", value)}
              value={formData.packageType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Package Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="parcel">Parcel</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
            />
            <Textarea
              placeholder="Special Instructions (e.g., Fragile)"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
            />
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Locations</h3>
            <Input
              placeholder="Pick-Up Location (e.g., Area 47, near Shoprite)"
              value={formData.pickupLocation}
              onChange={(e) => handleChange("pickupLocation", e.target.value)}
            />
            <Input
              placeholder="Delivery Location (e.g., Mzuzu Central Market)"
              value={formData.deliveryLocation}
              onChange={(e) => handleChange("deliveryLocation", e.target.value)}
            />
          </div>

          {/* Pick-Up Option */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-500" /> Pick-Up Option
            </h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pickupOption"
                  value="agent"
                  checked={formData.pickupOption === "agent"}
                  onChange={() => handleChange("pickupOption", "agent")}
                  className="mr-2"
                />
                Agent Pick-Up
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pickupOption"
                  value="hub"
                  checked={formData.pickupOption === "hub"}
                  onChange={() => handleChange("pickupOption", "hub")}
                  className="mr-2"
                />
                Drop at Hub
              </label>
            </div>
            {formData.pickupOption === "agent" && (
              <Select
                onValueChange={(value) => handleChange("pickupTime", value)}
                value={formData.pickupTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Pick-Up Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8am-12pm">8 AM - 12 PM</SelectItem>
                  <SelectItem value="12pm-4pm">12 PM - 4 PM</SelectItem>
                  <SelectItem value="4pm-8pm">4 PM - 8 PM</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Submit */}
          <div className="text-right">
            <Button
              type="submit"
              disabled={
                !formData.packageType ||
                !formData.pickupLocation ||
                !formData.deliveryLocation
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}