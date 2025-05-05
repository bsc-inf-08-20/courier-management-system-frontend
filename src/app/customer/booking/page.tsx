"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/customer/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Package, Truck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { MapComponent } from "@/components/MapComponent";

export default function Booking() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    packageType: "",
    weight: "",
    instructions: "",
    packageDescription: "",
    pickupLocation: "",
    pickupCoordinates: { lat: 0, lng: 0 },
    deliveryLocation: "",
    deliveryCoordinates: { lat: 0, lng: 0 },
    pickupTime: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/customer/auth");
  }, [isAuthenticated, router]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.packageType) newErrors.packageType = "Package type is required";
    if (!formData.pickupLocation) newErrors.pickupLocation = "Pick-up location is required";
    if (!formData.deliveryLocation) newErrors.deliveryLocation = "Delivery location is required";
    if (!formData.packageDescription) newErrors.packageDescription = "Package description is required";
    if (!formData.pickupTime) newErrors.pickupTime = "Pick-up time is required";
    if (formData.pickupCoordinates.lat === 0 || formData.pickupCoordinates.lng === 0)
      newErrors.pickupCoordinates = "Please set pick-up location on map";
    if (formData.deliveryCoordinates.lat === 0 || formData.deliveryCoordinates.lng === 0)
      newErrors.deliveryCoordinates = "Please set delivery location on map";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setApiError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setApiError("You must be logged in to book a pickup.");
      return;
    }

    const pickupRequestData = {
      package_type: formData.packageType,
      weight: parseFloat(formData.weight) || 0,
      special_instructions: formData.instructions,
      package_description: formData.packageDescription,
      origin_address: formData.pickupLocation,
      origin_coordinates: formData.pickupCoordinates,
      destination_address: formData.deliveryLocation,
      destination_coordinates: formData.deliveryCoordinates,
      pickup_time: formData.pickupTime,
    };

    try {
      const response = await fetch("http://localhost:3001/pickup/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pickupRequestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to request pickup");
      }

      const result = await response.json();
      setBookingId(result.id || "12345");
      setIsSubmitted(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An error occurred while booking.");
    }
  };

  if (!isAuthenticated) return null;

  if (isSubmitted) {
    return (
      <div className="min-h-screen min-w-full bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-2xl mx-auto px-4 py-8 text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-6">
            Booking Confirmed!
          </h2>
          <p>Your booking ID is #{bookingId}. You’ll receive a confirmation soon.</p>
          <Link href="/customer/tracking">
            <Button className="mt-4">Track Your Package</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Book a Courier
        </h2>
        {apiError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-6">
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
            {errors.packageType && (
              <Alert variant="destructive">
                <AlertDescription>{errors.packageType}</AlertDescription>
              </Alert>
            )}
            <Input
              placeholder="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
            />
            <Textarea
              placeholder="Package Description"
              value={formData.packageDescription}
              onChange={(e) => handleChange("packageDescription", e.target.value)}
            />
            {errors.packageDescription && (
              <Alert variant="destructive">
                <AlertDescription>{errors.packageDescription}</AlertDescription>
              </Alert>
            )}
            <Textarea
              placeholder="Special Instructions (e.g., Fragile)"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Locations</h3>
            <div>
              <Input
                placeholder="Pick-Up Location (e.g., Area 47, near Shoprite)"
                value={formData.pickupLocation}
                onChange={(e) => handleChange("pickupLocation", e.target.value)}
              />
              <Button
                type="button"
                onClick={() => setShowPickupMap(!showPickupMap)}
                className="mt-2"
              >
                {showPickupMap ? "Hide Map" : "Set Pick-Up Location on Map"}
              </Button>
              {showPickupMap && (
                <MapComponent
                  initialCenter={{ lat: -13.9626, lng: 33.7741 }}
                  onLocationSelect={(coords) =>
                    setFormData((prev) => ({
                      ...prev,
                      pickupCoordinates: coords,
                    }))
                  }
                  selectedCoordinates={formData.pickupCoordinates}
                />
              )}
              {formData.pickupCoordinates.lat !== 0 && formData.pickupCoordinates.lng !== 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected Pick-Up: Lat {formData.pickupCoordinates.lat.toFixed(4)}, Lng {formData.pickupCoordinates.lng.toFixed(4)}
                </p>
              )}
              {errors.pickupCoordinates && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.pickupCoordinates}</AlertDescription>
                </Alert>
              )}
            </div>
            <div>
              <Input
                placeholder="Delivery Location (e.g., Mzuzu Central Market)"
                value={formData.deliveryLocation}
                onChange={(e) => handleChange("deliveryLocation", e.target.value)}
              />
              <Button
                type="button"
                onClick={() => setShowDeliveryMap(!showDeliveryMap)}
                className="mt-2"
              >
                {showDeliveryMap ? "Hide Map" : "Set Delivery Location on Map"}
              </Button>
              {showDeliveryMap && (
                <MapComponent
                  initialCenter={{ lat: -13.9626, lng: 33.7741 }}
                  onLocationSelect={(coords) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliveryCoordinates: coords,
                    }))
                  }
                  selectedCoordinates={formData.deliveryCoordinates}
                />
              )}
              {formData.deliveryCoordinates.lat !== 0 && formData.deliveryCoordinates.lng !== 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected Delivery: Lat {formData.deliveryCoordinates.lat.toFixed(4)}, Lng {formData.deliveryCoordinates.lng.toFixed(4)}
                </p>
              )}
              {errors.deliveryCoordinates && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.deliveryCoordinates}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-500" /> Pick-Up Option
            </h3>
            <p>Agent Pick-Up</p>
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
            {errors.pickupTime && (
              <Alert variant="destructive">
                <AlertDescription>{errors.pickupTime}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="text-right">
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.packageType ||
                !formData.pickupLocation ||
                !formData.deliveryLocation ||
                !formData.pickupTime ||
                !formData.packageDescription ||
                formData.pickupCoordinates.lat === 0 ||
                formData.pickupCoordinates.lng === 0 ||
                formData.deliveryCoordinates.lat === 0 ||
                formData.deliveryCoordinates.lng === 0
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}