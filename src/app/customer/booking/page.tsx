"use client";

import { useState, useEffect, useMemo } from "react";
import { MapComponent } from "@/components/MapComponent";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { Package, MapPin, Clock, User } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  calculateDeliveryFee,
  getFeeBreakdown,
} from "@/utils/paymentCalculator";

const HUB_LOCATIONS = [
  { name: "Mzuzu", coordinates: { lat: -11.4656, lng: 34.0216 } },
  { name: "Lilongwe", coordinates: { lat: -13.9626, lng: 33.7741 } },
  { name: "Blantyre", coordinates: { lat: -15.7861, lng: 35.0058 } },
  { name: "Zomba", coordinates: { lat: -15.3833, lng: 35.3333 } },
  { name: "Karonga", coordinates: { lat: -9.95, lng: 33.9333 } },
  { name: "Kasungu", coordinates: { lat: -13.0333, lng: 33.4333 } },
  { name: "Mangochi", coordinates: { lat: -14.4667, lng: 35.2833 } },
  { name: "Salima", coordinates: { lat: -13.7667, lng: 34.5167 } },
];

const TIME_WINDOWS = [
  { label: "8:30 AM - 12:00 PM", value: ["08:30:00", "12:00:00"] },
  { label: "1:30 PM - 4:30 PM", value: ["13:30:00", "16:30:00"] },
];

type FormSection = {
  isComplete: boolean;
  label: string;
};

interface FormData {
  packet_description: string;
  packet_weight: string;
  packet_category: string;
  instructions: string;
  delivery_type: string;
  pickup_city: string;
  pickup_address: string;
  sender: {
    name: string;
    email: string;
    phone_number: string;
  };
  origin_coordinates: { lat: number; lng: number };
  receiver: {
    name: string;
    email: string;
    phone_number: string;
  };
  destination_hub: string;
  destination_address: string;
  destination_coordinates: { lat: number; lng: number };
}

interface UserData {
  name: string;
  email: string;
  phone_number: string;
  city: string;
}

const validateSection = (section: string, formData: FormData): boolean => {
  switch (section) {
    case "package":
      return !!(
        formData.packet_description &&
        formData.packet_weight &&
        formData.packet_category
      );
    case "delivery":
      return !!formData.delivery_type;
    case "receiver":
      return !!(
        formData.receiver.name &&
        formData.receiver.email &&
        formData.receiver.phone_number
      );
    case "locations":
      return !!(
        formData.destination_hub &&
        (formData.delivery_type === "pickup" ||
          (formData.destination_address &&
            formData.destination_coordinates.lat !== 0 &&
            formData.destination_coordinates.lng !== 0))
      );
    case "pickup":
      return !!(
        formData.pickup_city &&
        formData.pickup_address &&
        formData.origin_coordinates &&
        formData.origin_coordinates.lat !== 0 &&
        formData.origin_coordinates.lng !== 0
      );
    case "time":
      return true; // Handled separately with selectedDate and selectedTimeWindow
    default:
      return false;
  }
};

export default function BookingPageWrapper() {
  return <CustomerBooking />;
}

function CustomerBooking() {
  const router = useRouter();
  const [loading] = useState(false);
  const [, setUserData] = useState<UserData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    packet_description: "",
    packet_weight: "",
    packet_category: "",
    instructions: "",
    pickup_city: "",
    pickup_address: "",
    delivery_type: "pickup",
    sender: {
      name: "",
      email: "",
      phone_number: "",
    },
    origin_coordinates: { lat: 0, lng: 0 },
    receiver: {
      name: "",
      email: "",
      phone_number: "",
    },
    destination_hub: "",
    destination_address: "",
    destination_coordinates: { lat: 0, lng: 0 },
  });

  const [sections, setSections] = useState<{ [key: string]: FormSection }>({
    package: { isComplete: false, label: "Package Details" },
    delivery: { isComplete: false, label: "Delivery Type" },
    receiver: { isComplete: false, label: "Receiver Details" },
    locations: { isComplete: false, label: "Locations" },
    pickup: { isComplete: false, label: "Pickup Location" },
    time: { isComplete: false, label: "Time Window" },
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/me-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data: UserData = await response.json();
        setUserData(data);

        // Pre-fill sender information and pickup city
        setFormData((prev) => ({
          ...prev,
          sender: {
            name: data.name,
            email: data.email,
            phone_number: data.phone_number,
          },
          pickup_city: data.city,
          origin_coordinates: getCityCoordinates(data.city),
        }));
      } catch (error) {
        console.error("fetching user data Error:", error);
        toast.error("Failed to load user data");
      }
    };

    fetchUserData();
  }, []);

  const getCityCoordinates = (cityName: string) => {
    const hub = HUB_LOCATIONS.find((h) => h.name === cityName);
    return hub ? hub.coordinates : { lat: -13.9626, lng: 33.7741 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeWindow) {
      toast.error("Please select pickup date and time window");
      return;
    }

    const deliveryFee = calculateDeliveryFee(
      formData.pickup_city,
      formData.destination_hub,
      formData.packet_category,
      formData.delivery_type === "delivery",
      parseFloat(formData.packet_weight)
    );

    const feeBreakdown = getFeeBreakdown(
      formData.pickup_city,
      formData.destination_hub,
      formData.packet_category,
      formData.delivery_type === "delivery",
      parseFloat(formData.packet_weight)
    );

    try {
      // Create booking with origin_city and origin_address mapped from pickup_city and pickup_address
      const bookingResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/pickup/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...formData,
            origin_city: formData.pickup_city,
            origin_address: formData.pickup_address,
            packet_weight: parseFloat(formData.packet_weight),
            pickup_window: {
              start: `${format(selectedDate, "yyyy-MM-dd")}T${
                TIME_WINDOWS.find((tw) => tw.label === selectedTimeWindow)
                  ?.value[0]
              }`,
              end: `${format(selectedDate, "yyyy-MM-dd")}T${
                TIME_WINDOWS.find((tw) => tw.label === selectedTimeWindow)
                  ?.value[1]
              }`,
            },
            delivery_fee: deliveryFee,
          }),
        }
      );

      if (!bookingResponse.ok) throw new Error("Booking creation failed");

      const bookingData = await bookingResponse.json();

      // Redirect to payment page with all necessary data
      router.push(
        `/customer/payment?${new URLSearchParams({
          booking_id: bookingData.id,
          amount: deliveryFee.toString(),
          email: formData.sender.email,
          name: formData.sender.name,
          origin_city: formData.pickup_city,
          destination: formData.destination_hub,
          category: formData.packet_category,
          delivery_type: formData.delivery_type,
          weight: formData.packet_weight,
          ...Object.fromEntries(
            Object.entries(feeBreakdown).map(([key, value]) => [
              key,
              value.toString(),
            ])
          ),
        })}`
      );
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking");
    }
  };

  // Fix the validation effect to prevent infinite loops
  useEffect(() => {
    // Create a new object instead of mutating the existing one
    const updatedSections = {} as { [key: string]: FormSection };

    // Validate each section
    Object.keys(sections).forEach((section) => {
      updatedSections[section] = {
        ...sections[section],
        isComplete:
          section === "time"
            ? !!(selectedDate && selectedTimeWindow)
            : validateSection(section, formData),
      };
    });

    // Only update state if there are actual changes
    if (JSON.stringify(updatedSections) !== JSON.stringify(sections)) {
      setSections(updatedSections);
    }
  }, [formData, selectedDate, selectedTimeWindow]);

  const progress = useMemo(() => {
    const completedSections = Object.values(sections).filter(
      (s) => s.isComplete
    ).length;
    return (completedSections / Object.keys(sections).length) * 100;
  }, [sections]);

  const isFormValid = useMemo(() => {
    return Object.values(sections).every((section) => section.isComplete);
  }, [sections]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl">Book a Pickup</CardTitle>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm mt-2">{Math.round(progress)}% completed</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Accordion type="single" collapsible defaultValue="package">
              {/* Package Details Section */}
              <AccordionItem value="package">
                <AccordionTrigger className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    <span>Package Details</span>
                  </div>
                  {sections.package.isComplete && (
                    <span className="text-green-500 text-sm">✓ Complete</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">Package Details</h3>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Package Category</Label>
                        <Select
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              packet_category: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electronics">
                              Electronics
                            </SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          value={formData.packet_weight}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              packet_weight: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Input
                          value={formData.packet_description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              packet_description: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Special Instructions</Label>
                        <Input
                          value={formData.instructions}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              instructions: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Pickup Location Section */}
              <AccordionItem value="pickup">
                <AccordionTrigger className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span>Pickup Location</span>
                  </div>
                  {sections.pickup.isComplete && (
                    <span className="text-green-500 text-sm">✓ Complete</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">Pickup Location</h3>
                    </div>
                    <Separator />

                    {/* Origin City Selection */}
                    <div>
                      <Label>Pickup City</Label>
                      <Select
                        value={formData.pickup_city}
                        onValueChange={(value) => {
                          const coords = getCityCoordinates(value);
                          setFormData((prev) => ({
                            ...prev,
                            pickup_city: value,
                            origin_coordinates: coords,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pickup city" />
                        </SelectTrigger>
                        <SelectContent>
                          {HUB_LOCATIONS.map((hub) => (
                            <SelectItem key={hub.name} value={hub.name}>
                              {hub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Specific Pickup Location Map */}
                    <div className="space-y-4">
                      <Label>Pickup Address</Label>
                      <MapComponent
                        initialCenter={formData.origin_coordinates}
                        onLocationSelect={(coords) =>
                          setFormData((prev) => ({
                            ...prev,
                            origin_coordinates: coords,
                          }))
                        }
                        selectedCoordinates={formData.origin_coordinates}
                        label="Select pickup address"
                        onAddressChange={(address) =>
                          setFormData((prev) => ({
                            ...prev,
                            pickup_address: address,
                          }))
                        }
                        addressInputValue={formData.pickup_address}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Delivery Type Section */}
              <AccordionItem value="delivery">
                <AccordionTrigger className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span>Delivery Type</span>
                  </div>
                  {sections.delivery.isComplete && (
                    <span className="text-green-500 text-sm">✓ Complete</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">Delivery Type</h3>
                    </div>
                    <Separator />
                    <Select
                      value={formData.delivery_type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          delivery_type: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup">Hub Pickup</SelectItem>
                        <SelectItem value="delivery">Home Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Receiver Information */}
              <AccordionItem value="receiver">
                <AccordionTrigger className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    <span>Receiver Details</span>
                  </div>
                  {sections.receiver.isComplete && (
                    <span className="text-green-500 text-sm">✓ Complete</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">
                        Receiver Details
                      </h3>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Name"
                        value={formData.receiver.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            receiver: {
                              ...prev.receiver,
                              name: e.target.value,
                            },
                          }))
                        }
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={formData.receiver.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            receiver: {
                              ...prev.receiver,
                              email: e.target.value,
                            },
                          }))
                        }
                      />
                      <Input
                        placeholder="Phone Number"
                        value={formData.receiver.phone_number}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            receiver: {
                              ...prev.receiver,
                              phone_number: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Location Section */}
              <AccordionItem value="locations">
                <AccordionTrigger className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span>Locations</span>
                  </div>
                  {sections.locations.isComplete && (
                    <span className="text-green-500 text-sm">✓ Complete</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">Locations</h3>
                    </div>
                    <Separator />

                    {/* Always show destination hub selection */}
                    <div>
                      <Label>Destination Hub</Label>
                      <Select
                        value={formData.destination_hub}
                        onValueChange={(value) => {
                          const coords = getCityCoordinates(value);
                          setFormData((prev) => ({
                            ...prev,
                            destination_hub: value,
                            destination_address: value,
                            destination_coordinates: coords,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination hub" />
                        </SelectTrigger>
                        <SelectContent>
                          {HUB_LOCATIONS.map((hub) => (
                            <SelectItem key={hub.name} value={hub.name}>
                              {hub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Show additional delivery location for home delivery */}
                    {formData.delivery_type === "delivery" && (
                      <div className="space-y-4">
                        <MapComponent
                          initialCenter={formData.destination_coordinates}
                          onLocationSelect={(coords) =>
                            setFormData((prev) => ({
                              ...prev,
                              destination_coordinates: coords,
                            }))
                          }
                          selectedCoordinates={formData.destination_coordinates}
                          label="Select delivery location"
                          onAddressChange={(address) =>
                            setFormData((prev) => ({
                              ...prev,
                              destination_address: address,
                            }))
                          }
                          addressInputValue={formData.destination_address}
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Pickup Window Section */}
              <AccordionItem value="time">
                <AccordionTrigger className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>Pickup Window</span>
                  </div>
                  {sections.time.isComplete && (
                    <span className="text-green-500 text-sm">✓ Complete</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">Pickup Window</h3>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date: Date | undefined) =>
                            setSelectedDate(date || undefined)
                          }
                          className="rounded-md border"
                          disabled={(date) =>
                            date < new Date() || date > new Date(2025, 11, 31)
                          }
                        />
                      </div>
                      <div>
                        <Label>Select Time Window</Label>
                        <Select
                          value={selectedTimeWindow}
                          onValueChange={setSelectedTimeWindow}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time window" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_WINDOWS.map((tw) => (
                              <SelectItem key={tw.label} value={tw.label}>
                                {tw.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading || !isFormValid}
            >
              {loading ? "Creating Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}