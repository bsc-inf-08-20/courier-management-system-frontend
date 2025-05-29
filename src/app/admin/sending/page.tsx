/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@googlemaps/js-api-loader";
import { MapComponent } from "@/components/MapComponent";
import { calculateHubDeliveryFee } from "@/lib/pricing";
import jsPDF from "jspdf";

const HUB_LOCATIONS = [
  { name: "Mzuzu", coordinates: { lat: -11.4656, lng: 34.0216 } },
  { name: "Lilongwe", coordinates: { lat: -13.9626, lng: 33.7741 } },
  { name: "Blantyre", coordinates: { lat: -15.7861, lng: 35.0058 } },
  { name: "Karonga", coordinates: { lat: -9.9333, lng: 33.9333 } },
  { name: "Zomba", coordinates: { lat: -15.385, lng: 35.318 } },
  { name: "Mangochi", coordinates: { lat: -14.4667, lng: 35.2833 } },
  { name: "Kasungu", coordinates: { lat: -13.0333, lng: 33.4833 } },
  { name: "Salima", coordinates: { lat: -13.7667, lng: 34.5167 } },
  { name: "Dedza", coordinates: { lat: -14.1667, lng: 34.3333 } },
];

interface PacketSummary {
  trackingId: string;
  description: string;
  weight: string;
  category: string;
  sender: {
    name: string;
    email: string;
    phone_number: string;
  };
  receiver: {
    name: string;
    email: string;
    phone_number: string;
  };
  origin_city: string;
  destination_hub: string;
  delivery_type: string;
  totalAmount: number;
  created_at: string;
}

export default function CreatePacketPage() {
  const [, setResponseData] = useState<any>(null);
  const [formData, setFormData] = useState({
    description: "",
    weight: "",
    category: "",
    instructions: "",
    origin_city: "",
    origin_coordinates: { lat: 0, lng: 0 },
    destination_address: "",
    destination_coordinates: { lat: 0, lng: 0 },
    delivery_type: "pickup",
    destination_hub: "",
    sender: {
      name: "",
      email: "",
      phone_number: "",
    },
    receiver: {
      name: "",
      email: "",
      phone_number: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [adminCity, setAdminCity] = useState("");
  const [adminEmail, setAdminEmail] = useState<string>("Admin"); // State to store admin email
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [packetSummary, setPacketSummary] = useState<PacketSummary | null>(
    null
  );

  useAuth("ADMIN");

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/me-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch admin data");

        const data = await res.json();
        setAdminCity(data.city || "Unknown City");
        // Store the email
        setAdminEmail(data.email || "Unknown Email");

        const cityCoordinates = getCityCoordinates(data.city);
        setFormData((prev) => ({
          ...prev,
          origin_city: data.city,
          origin_coordinates: cityCoordinates,
          destination_hub: data.city || "",
          destination_address: `${data.city}`,
        }));
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin location");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (formData.delivery_type !== "delivery" || !mapRef.current) return;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"],
    });

    let mapInstance: google.maps.Map;
    let markerInstance: google.maps.Marker | null = null;

    loader.load().then(() => {
      const cityCoords = getCityCoordinates(adminCity);
      mapInstance = new google.maps.Map(mapRef.current!, {
        center: { lat: cityCoords.lat, lng: cityCoords.lng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });

      // Add click event listener
      mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setFormData((prev) => ({
          ...prev,
          destination_coordinates: { lat, lng },
        }));

        // Update or create marker
        if (markerInstance) {
          markerInstance.setPosition(e.latLng);
        } else {
          markerInstance = new google.maps.Marker({
            position: e.latLng,
            map: mapInstance,
            title: "Delivery Location",
          });
          setMarker(markerInstance);
        }
      });

      setMap(mapInstance);
    });

    return () => {
      if (markerInstance) {
        markerInstance.setMap(null);
      }
      if (mapInstance) {
        google.maps.event.clearInstanceListeners(mapInstance);
      }
    };
  }, [formData.delivery_type, adminCity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("sender.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        sender: { ...prev.sender, [field]: value },
      }));
    } else if (name.startsWith("receiver.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        receiver: { ...prev.receiver, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleHubChange = (value: string) => {
    const selectedHub = HUB_LOCATIONS.find((hub) => hub.name === value);
    setFormData((prev) => ({
      ...prev,
      destination_hub: value,
      destination_address: `${value}`,
      destination_coordinates: selectedHub
        ? selectedHub.coordinates
        : { lat: 0, lng: 0 },
    }));
  };

  const handleDeliveryTypeChange = (value: "pickup" | "delivery") => {
    setFormData((prev) => ({
      ...prev,
      delivery_type: value,
      destination_address:
        value === "pickup" ? `${prev.destination_hub || adminCity}` : "",
      destination_coordinates:
        value === "pickup"
          ? getCityCoordinates(prev.destination_hub || adminCity)
          : { lat: 0, lng: 0 },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const packetData = {
        ...formData,
        weight: parseFloat(formData.weight),
        status: "at_origin_hub",
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}:3001/packets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(packetData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create packet");
      }
      const data = await res.json();
      setResponseData(data);

      // Calculate total before reset
      const totalAmount = calculateTotalAmount();

      // Store all relevant data for receipt/QR
      const summary = {
        trackingId: data.trackingId,
        description: formData.description,
        weight: formData.weight,
        category: formData.category,
        sender: { ...formData.sender },
        receiver: { ...formData.receiver },
        origin_city: formData.origin_city,
        destination_hub: formData.destination_hub,
        delivery_type: formData.delivery_type,
        totalAmount,
        created_at: new Date().toLocaleString(),
      };
      setPacketSummary(summary);

      // Send receipt to both sender and receiver
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/packets/notifications/send-packet-receipt`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              ...summary, // your receipt summary object
              sender: { ...formData.sender },
              receiver: { ...formData.receiver },
            }),
          }
        );
        toast.success("Receipt sent to both sender and receiver!");
      } catch (err) {
        console.log(err);
        toast.error("Could not send receipt to emails.");
      }

      // Generate QR code data with all the form data
      setQrCodeData(
        `PACKET ID: ${data.trackingId}\n` +
          `DESCRIPTION: ${formData.description}\n` +
          `WEIGHT: ${formData.weight} kg\n` +
          `CATEGORY: ${formData.category}\n\n` +
          `SENDER: ${formData.sender.name}\n` +
          `PHONE: ${formData.sender.phone_number}\n\n` +
          `RECEIVER: ${formData.receiver.name}\n` +
          `PHONE: ${formData.receiver.phone_number}\n\n` +
          `ORIGIN: ${formData.origin_city}\n` +
          `DESTINATION: ${formData.destination_hub}\n\n` +
          `TOTAL AMOUNT: MWK ${totalAmount}`
      );

      setQrCodeOpen(true);

      // Now reset the form
      setFormData({
        description: "",
        weight: "",
        category: "",
        instructions: "",
        origin_city: adminCity,
        origin_coordinates: getCityCoordinates(adminCity),
        destination_address:
          formData.delivery_type === "pickup" ? `${adminCity} Hub` : "",
        destination_coordinates:
          formData.delivery_type === "pickup"
            ? getCityCoordinates(adminCity)
            : { lat: 0, lng: 0 },
        delivery_type: "pickup",
        destination_hub: adminCity,
        sender: { name: "", email: "", phone_number: "" },
        receiver: { name: "", email: "", phone_number: "" },
      });
      toast.success("Packet created successfully");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCityCoordinates = (city: string) => {
    const hub = HUB_LOCATIONS.find((h) => h.name === city);
    return hub ? hub.coordinates : { lat: -13.9626, lng: 33.7741 };
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeRef.current) return;

    const qrCodeElement = qrCodeRef.current.querySelector("canvas");
    if (!qrCodeElement) {
      const svgElement = qrCodeRef.current.querySelector("svg");
      if (!svgElement) {
        console.error("No QR code element found");
        return;
      }

      const canvas = document.createElement("canvas");
      const rect = svgElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const DOMURL = window.URL || window.webkitURL || window;
      const img = new Image();
      const svgUrl = DOMURL.createObjectURL(svgBlob);

      img.onload = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Could not get canvas context");
          return;
        }
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(svgUrl);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `packet-qr-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      img.src = svgUrl;
    } else {
      const pngUrl = qrCodeElement.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `packet-qr-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const calculateTotalAmount = () => {
    if (
      !formData.origin_city ||
      !formData.destination_hub ||
      !formData.weight
    ) {
      return 0;
    }

    return calculateHubDeliveryFee(
      formData.origin_city,
      formData.destination_hub,
      formData.delivery_type,
      parseFloat(formData.weight)
    );
  };

  //   const handleDownloadReceipt = () => {
  //     if (!packetSummary) return;

  //     const receiptContent = `
  // COURIER MANAGEMENT SYSTEM
  // -------------------------
  // PACKET RECEIPT
  // Date: ${packetSummary.created_at}

  // Packet Details:
  // Tracking ID: ${packetSummary.trackingId}
  // Description: ${packetSummary.description}
  // Weight: ${packetSummary.weight} kg
  // Category: ${packetSummary.category}

  // Sender Details:
  // Name: ${packetSummary.sender.name}
  // Email: ${packetSummary.sender.email}
  // Phone: ${packetSummary.sender.phone_number}

  // Receiver Details:
  // Name: ${packetSummary.receiver.name}
  // Email: ${packetSummary.receiver.email}
  // Phone: ${packetSummary.receiver.phone_number}

  // Location Details:
  // Origin: ${packetSummary.origin_city}
  // Destination: ${packetSummary.destination_hub}
  // Delivery Type: ${
  //       packetSummary.delivery_type === "delivery"
  //         ? "Home Delivery"
  //         : "Hub Pickup"
  //     }

  // PAYMENT DETAILS
  // -------------------------
  // Total Amount: MWK ${packetSummary.totalAmount}

  // Thank you for using our service!
  // `;

  //     const blob = new Blob([receiptContent], { type: "text/plain" });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `packet-receipt-${Date.now()}.txt`;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   };

  const handleDownloadPdfReceipt = () => {
    if (!packetSummary) return;

    const doc = new jsPDF();

    // Add company header
    doc.setFontSize(20);
    doc.text("Courier Management System", 105, 20, { align: "center" });

    // Add receipt title
    doc.setFontSize(16);
    doc.text("PACKET RECEIPT", 105, 30, { align: "center" });

    // Add current date and time
    doc.setFontSize(10);
    doc.text(`Date: ${packetSummary.created_at}`, 20, 40);

    // Add packet details
    doc.setFontSize(12);
    doc.text("Packet Details:", 20, 50);
    doc.setFontSize(10);
    doc.text(`Tracking ID: ${packetSummary.trackingId || "N/A"}`, 25, 60);
    doc.text(`Description: ${packetSummary.description}`, 25, 70);
    doc.text(`Weight: ${packetSummary.weight} kg`, 25, 80);
    doc.text(`Category: ${packetSummary.category}`, 25, 90);

    // Add sender details
    doc.setFontSize(12);
    doc.text("Sender Details:", 20, 105);
    doc.setFontSize(10);
    doc.text(`Name: ${packetSummary.sender.name}`, 25, 115);
    doc.text(`Email: ${packetSummary.sender.email}`, 25, 125);
    doc.text(`Phone: ${packetSummary.sender.phone_number}`, 25, 135);

    // Add receiver details
    doc.setFontSize(12);
    doc.text("Receiver Details:", 20, 150);
    doc.setFontSize(10);
    doc.text(`Name: ${packetSummary.receiver.name}`, 25, 160);
    doc.text(`Email: ${packetSummary.receiver.email}`, 25, 170);
    doc.text(`Phone: ${packetSummary.receiver.phone_number}`, 25, 180);

    // Add location details
    doc.setFontSize(12);
    doc.text("Location Details:", 20, 195);
    doc.setFontSize(10);
    doc.text(`Origin: ${packetSummary.origin_city}`, 25, 205);
    doc.text(`Destination: ${packetSummary.destination_hub}`, 25, 215);
    doc.text(
      `Delivery Type: ${
        packetSummary.delivery_type === "delivery"
          ? "Home Delivery"
          : "Hub Pickup"
      }`,
      25,
      225
    );

    // Add payment breakdown
    doc.setFontSize(12);
    doc.text("Payment Details:", 20, 240);
    doc.setFontSize(10);
    doc.text(`Total Amount: MWK ${packetSummary.totalAmount}`, 25, 250);

    // Add footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const currentDate = new Date().toISOString().split("T")[0];
    doc.text(`Generated on ${currentDate} by ${adminEmail}`, 105, 295, {
      align: "center",
    });

    // Save the PDF
    doc.save(`packet-receipt-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <Dialog open={qrCodeOpen} onOpenChange={setQrCodeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Packet QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div
              className="p-4 bg-white rounded-lg border border-gray-200"
              ref={qrCodeRef}
            >
              <QRCodeSVG value={qrCodeData || ""} size={200} />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                Total Amount: MWK {packetSummary?.totalAmount || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Print or download this QR code and attach it to the packet for
                tracking purposes.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleDownloadQrCode}
                variant="outline"
                className="flex-1"
              >
                Download QR Code
              </Button>
              <Button
                onClick={handleDownloadPdfReceipt}
                variant="outline"
                className="flex-1"
              >
                Download PDF Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="max-w-6xl mx-auto shadow-lg bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <CardTitle className="text-2xl font-bold">
            Create New Packet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Packet Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Packet Information
                </h3>
                <Separator className="mb-4" />
              </div>

              <div>
                <Label htmlFor="category" className="text-gray-700 font-medium">
                  Category
                </Label>
                <Select onValueChange={handleCategoryChange} required>
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weight" className="text-gray-700 font-medium">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g., 2.5"
                  className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-medium"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Fragile electronics"
                  className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <Label
                  htmlFor="instructions"
                  className="text-gray-700 font-medium"
                >
                  Special Instructions
                </Label>
                <Input
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="e.g., Handle with care"
                  className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Sender Information
                </h3>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="sender.name"
                      className="text-gray-700 font-medium"
                    >
                      Name
                    </Label>
                    <Input
                      id="sender.name"
                      name="sender.name"
                      value={formData.sender.name}
                      onChange={handleChange}
                      placeholder="e.g., John Doe"
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="sender.email"
                      className="text-gray-700 font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="sender.email"
                      name="sender.email"
                      type="email"
                      value={formData.sender.email}
                      onChange={handleChange}
                      placeholder="e.g., john.doe@example.com"
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="sender.phone_number"
                      className="text-gray-700 font-medium"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="sender.phone_number"
                      name="sender.phone_number"
                      value={formData.sender.phone_number}
                      onChange={handleChange}
                      placeholder="e.g., +265123456789"
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Receiver Information
                </h3>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="receiver.name"
                      className="text-gray-700 font-medium"
                    >
                      Name
                    </Label>
                    <Input
                      id="receiver.name"
                      name="receiver.name"
                      value={formData.receiver.name}
                      onChange={handleChange}
                      placeholder="e.g., Jane Smith"
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="receiver.email"
                      className="text-gray-700 font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="receiver.email"
                      name="receiver.email"
                      type="email"
                      value={formData.receiver.email}
                      onChange={handleChange}
                      placeholder="e.g., jane.smith@example.com"
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="receiver.phone_number"
                      className="text-gray-700 font-medium"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="receiver.phone_number"
                      name="receiver.phone_number"
                      value={formData.receiver.phone_number}
                      onChange={handleChange}
                      placeholder="e.g., +265987654321"
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Delivery Information
              </h3>
              <Separator className="mb-4" />

              <div className="mb-6">
                <Label className="text-gray-700 font-medium block mb-2">
                  Delivery Option
                </Label>
                <RadioGroup
                  defaultValue="pickup"
                  value={formData.delivery_type}
                  onValueChange={handleDeliveryTypeChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup">Customer will pick up at hub</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery">
                      Deliver to customer location
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="mb-4">
                <Label
                  htmlFor="origin_city"
                  className="text-gray-700 font-medium"
                >
                  Origin Address
                </Label>
                <Input
                  id="origin_city"
                  name="origin_city"
                  value={formData.origin_city}
                  onChange={handleChange}
                  className="mt-1 border-gray-300 bg-gray-100 cursor-not-allowed"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">
                  Automatically set to your city
                </p>
              </div>

              {formData.delivery_type === "pickup" && (
                <div>
                  <Label
                    htmlFor="destination_hub"
                    className="text-gray-700 font-medium"
                  >
                    Destination Hub
                  </Label>
                  <Select
                    onValueChange={handleHubChange}
                    value={formData.destination_hub}
                    required
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select a hub location" />
                    </SelectTrigger>
                    <SelectContent>
                      {HUB_LOCATIONS.map((hub) => (
                        <SelectItem key={hub.name} value={hub.name}>
                          {hub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="destination_address"
                    name="destination_address"
                    value={formData.destination_address}
                    className="mt-2 border-gray-300 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
              )}

              {formData.delivery_type === "delivery" && (
                <>
                  <div className="mb-4">
                    <Label
                      htmlFor="destination_address"
                      className="text-gray-700 font-medium"
                    >
                      Delivery Address
                    </Label>
                    <Input
                      id="destination_address"
                      name="destination_address"
                      value={formData.destination_address}
                      onChange={handleChange}
                      placeholder="e.g., Area 10, Blantyre"
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <MapComponent
                    initialCenter={getCityCoordinates(
                      formData.destination_address
                    )}
                    onLocationSelect={(coords) =>
                      setFormData((prev) => ({
                        ...prev,
                        destination_coordinates: coords,
                      }))
                    }
                    selectedCoordinates={formData.destination_coordinates}
                  />
                </>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg"
              disabled={
                loading ||
                !formData.category ||
                !formData.description ||
                !formData.weight ||
                !formData.sender.name ||
                !formData.sender.email ||
                !formData.sender.phone_number ||
                !formData.receiver.name ||
                !formData.receiver.email ||
                !formData.receiver.phone_number ||
                (formData.delivery_type === "delivery" &&
                  formData.destination_coordinates.lat === 0) ||
                (formData.delivery_type === "pickup" &&
                  !formData.destination_hub)
              }
            >
              {loading ? "Creating..." : "Create Packet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
