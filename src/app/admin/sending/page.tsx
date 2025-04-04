"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import { LatLng } from "leaflet";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const HUB_LOCATIONS = [
  { name: "Mzuzu", coordinates: { lat: -11.4656, lng: 34.0216 } },
  { name: "Lilongwe", coordinates: { lat: -13.9626, lng: 33.7741 } },
  { name: "Blantyre", coordinates: { lat: -15.7861, lng: 35.0058 } },
];

export default function CreatePacketPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: "",
    weight: "",
    category: "",
    instructions: "",
    origin_address: "",
    origin_coordinates: { lat: 0, lng: 0 },
    destination_address: "",
    destination_coordinates: { lat: 0, lng: 0 },
    delivery_type: "pickup", // 'pickup' or 'delivery'
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
  const [mapPosition, setMapPosition] = useState<LatLng | null>(null);
  const [adminCity, setAdminCity] = useState("");
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Use auth hook to ensure admin access
  useAuth("ADMIN");

  // Fix Leaflet icon issue and fetch admin data
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "/images/marker-icon.png",
      iconRetinaUrl: "/images/marker-icon-2x.png",
      shadowUrl: "/images/marker-shadow.png",
    });

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch admin data");

        const data = await res.json();
        setAdminCity(data.city || "Unknown City");

        const cityCoordinates = getCityCoordinates(data.city);
        setFormData((prev) => ({
          ...prev,
          origin_address: data.city,
          origin_coordinates: cityCoordinates,
          destination_hub: data.city || "",
          destination_address: `${data.city} Hub`,
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

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("sender.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        sender: {
          ...prev.sender,
          [field]: value,
        },
      }));
    } else if (name.startsWith("receiver.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        receiver: {
          ...prev.receiver,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  // Handle hub selection
  const handleHubChange = (value: string) => {
    const selectedHub = HUB_LOCATIONS.find((hub) => hub.name === value);
    setFormData((prev) => ({
      ...prev,
      destination_hub: value,
      destination_address: `${value} Hub`,
      destination_coordinates: selectedHub
        ? selectedHub.coordinates
        : { lat: 0, lng: 0 },
    }));
  };

  // Handle delivery type change
  const handleDeliveryTypeChange = (value: "pickup" | "delivery") => {
    setFormData((prev) => ({
      ...prev,
      delivery_type: value,
      destination_address:
        value === "pickup" ? `${prev.destination_hub || adminCity} Hub` : "",
      destination_coordinates:
        value === "pickup"
          ? getCityCoordinates(prev.destination_hub || adminCity)
          : { lat: 0, lng: 0 },
    }));
    if (value === "pickup") setMapPosition(null);
  };

  // Map click handler
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFormData((prev) => ({
          ...prev,
          destination_coordinates: { lat, lng },
        }));
        setMapPosition(new LatLng(lat, lng));
      },
    });
    return null;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const packetData = {
        ...formData,
        weight: parseFloat(formData.weight),
        status: "at_origin_hub",
      };

      const res = await fetch("http://localhost:3001/packets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(packetData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create packet");
      }

      const responseData = await res.json();
      toast.success("Packet created successfully");
      setQrCodeOpen(true);

      // Reset form data to initial state, preserving origin data from admin
      setFormData({
        description: "",
        weight: "",
        category: "",
        instructions: "",
        origin_address: adminCity,
        origin_coordinates: getCityCoordinates(adminCity),
        destination_address:
          formData.delivery_type === "pickup" ? `${adminCity} Hub` : "",
        destination_coordinates:
          formData.delivery_type === "pickup"
            ? getCityCoordinates(adminCity)
            : { lat: 0, lng: 0 },
        delivery_type: "pickup",
        destination_hub: adminCity,
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
      setMapPosition(null);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Get city coordinates
  const getCityCoordinates = (city: string) => {
    const hub = HUB_LOCATIONS.find((h) => h.name === city);
    return hub ? hub.coordinates : { lat: -13.9626, lng: 33.7741 }; // Default to Lilongwe
  };

  // Generate QR code data
  const generateQrData = () => {
    return JSON.stringify({
      packetId: Date.now().toString(),
      description: formData.description,
      weight: formData.weight,
      category: formData.category,
      sender: formData.sender,
      receiver: formData.receiver,
      origin: formData.origin_address,
      destination: formData.destination_address,
      createdAt: new Date().toISOString(),
    });
  };

  // Download QR code as PNG - Improved version
  const handleDownloadQrCode = () => {
    if (!qrCodeRef.current) return;

    const qrCodeElement = qrCodeRef.current.querySelector("canvas");
    if (!qrCodeElement) {
      // If no canvas (happens with QRCode.react), try getting the SVG
      const svgElement = qrCodeRef.current.querySelector("svg");
      if (!svgElement) {
        console.error("No QR code element found");
        return;
      }

      // Create a canvas with proper dimensions
      const canvas = document.createElement("canvas");
      const rect = svgElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Convert SVG to data URL then to image
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

        // Download as PNG
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
      // QR code is already a canvas, just download it
      const pngUrl = qrCodeElement.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `packet-qr-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
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
              <div ref={qrCodeRef}>
                <QRCodeSVG value={generateQrData()} size={200} />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Print or download this QR code and attach it to the packet for
              tracking purposes.
            </p>
            <Button
              onClick={handleDownloadQrCode}
              variant="outline"
              className="w-full"
            >
              Download QR Code
            </Button>
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

              {/* Category */}
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

              {/* Weight */}
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

              {/* Description */}
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

              {/* Instructions */}
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

            {/* Sender and Receiver Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender Information */}
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

              {/* Receiver Information */}
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

            {/* Delivery Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Delivery Information
              </h3>
              <Separator className="mb-4" />

              {/* Delivery Type */}
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

              {/* Origin Address */}
              <div className="mb-4">
                <Label
                  htmlFor="origin_address"
                  className="text-gray-700 font-medium"
                >
                  Origin Address
                </Label>
                <Input
                  id="origin_address"
                  name="origin_address"
                  value={formData.origin_address}
                  onChange={handleChange}
                  className="mt-1 border-gray-300 bg-gray-100 cursor-not-allowed"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">
                  Automatically set to your city
                </p>
              </div>

              {/* Destination Hub (for pickup) */}
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

              {/* Delivery Address and Map (for delivery) */}
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
                  <div className="mb-4">
                    <Label className="text-gray-700 font-medium block mb-2">
                      Select Delivery Location
                    </Label>
                    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                        <span className="font-medium">Map Location</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Click on the map to set the exact delivery
                                location
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="h-64">
                        <MapContainer
                          center={[
                            getCityCoordinates(adminCity).lat,
                            getCityCoordinates(adminCity).lng,
                          ]}
                          zoom={13}
                          scrollWheelZoom={true}
                          style={{ height: "100%", width: "100%", zIndex: 0 }}
                        >
                          <TileLayer
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapClickHandler />
                          {mapPosition && (
                            <Marker position={mapPosition}>
                              <Popup>
                                Delivery Location
                                <br />
                                Lat: {mapPosition.lat.toFixed(4)}, Lng:{" "}
                                {mapPosition.lng.toFixed(4)}
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                      </div>
                      <div className="p-3 border-t">
                        {formData.destination_coordinates.lat !== 0 ? (
                          <p className="text-sm text-green-600">
                            Selected: Lat:{" "}
                            {formData.destination_coordinates.lat.toFixed(4)},
                            Lng:{" "}
                            {formData.destination_coordinates.lng.toFixed(4)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Click on the map to select a location
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
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
