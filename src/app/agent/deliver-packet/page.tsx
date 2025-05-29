"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import SignaturePad from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Packet {
  id: number;
  trackingId: string;
  description: string;
  destination_coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  sent_date: string;
  customer: {
    name: string;
    phone_number: string;
  };
  status?: "Pending" | "Delivered";
  signature_base64?: string;
}

export default function AgentDeliveryPage() {
  const router = useRouter();
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [currentPacketId, setCurrentPacketId] = useState<number | null>(null);
  const [nationalId, setNationalId] = useState<string>("");
  const signaturePadRef = useRef<SignaturePad>(null);

  // Fetch packets assigned to this agent
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchPackets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/packets/delivery-agent/packets`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        // Transform the data to match our component's needs
        const transformedData = data.map((packet: Packet) => ({
          ...packet,
          status: packet.status || "Pending delivery",
          customerName: packet.customer.name,
        }));
        setPackets(transformedData);
      } catch (error) {
        console.error("Error fetching packets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackets();
  }, []);

  const handleMarkDelivered = async (id: number) => {
    setCurrentPacketId(id);
    setIsSignatureModalOpen(true);
  };

  const handleConfirmDelivery = async (): Promise<void> => {
    if (!currentPacketId || !signaturePadRef.current) return;

    const token = localStorage.getItem("token");
    try {
      // Get signature as base64 string
      const signatureBase64 = signaturePadRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

      // Update local state first for immediate feedback
      setPackets((prev) =>
        prev.map((packet) =>
          packet.id === currentPacketId
            ? {
                ...packet,
                status: "Delivered",
                signature_base64: signatureBase64,
              }
            : packet
        )
      );

      // Call API to update status and signature
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/${currentPacketId}/mark-delivered`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            signature_base64: signatureBase64,
            nationalId: nationalId, // Include nationalId
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      // Send delivery confirmation email
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/notifications/delivery-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            packetId: currentPacketId,
          }),
        }
      );

      toast.success("Package marked as delivered and confirmation email sent");
      setIsSignatureModalOpen(false);
      setNationalId(""); // Clear the national ID after successful submission
    } catch (error) {
      console.error("Error marking as delivered:", error);
      toast.error("Failed to update delivery status");
      // Revert state on error
      setPackets((prev) =>
        prev.map((packet) =>
          packet.id === currentPacketId
            ? { ...packet, status: "Pending", signature_base64: undefined }
            : packet
        )
      );
    }
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
          Deliver Packets
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {packets.map((packet) => (
            <Card
              key={packet.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    ID: #{packet.trackingId}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      packet.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {packet.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className=" items-center space-x-2">
                    <div>
                      <span className="capitalize font-bold">
                        {packet.description}
                      </span>
                    </div>
                    <div>
                      <span className="capitalize">{packet.customer.name}</span>
                    </div>
                    <div>
                      <span className="capitalize">
                        {packet.customer.phone_number}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <button
                      onClick={() =>
                        router.push(
                          `/agent/map?lat=${packet.destination_coordinates.lat}&lng=${packet.destination_coordinates.lng}`
                        )
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View on Map
                    </button>
                  </div>

                  <Button
                    onClick={() => handleMarkDelivered(packet.id)}
                    disabled={packet.status === "Delivered"}
                    className={`w-full ${
                      packet.status === "Delivered"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {packet.status === "Delivered" ? (
                      <span className="flex items-center space-x-2">
                        <Check className="h-5 w-5" />
                        <span>Delivered</span>
                      </span>
                    ) : (
                      "Mark as Delivered"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {packets.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">No Packets</h3>
              <p className="mt-2 text-gray-500">
                There are no packets assigned for delivery at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={isSignatureModalOpen}
        onOpenChange={setIsSignatureModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Signature</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="border rounded-lg p-2 bg-white">
              <SignaturePad
                ref={signaturePadRef}
                canvasProps={{
                  className: "w-full h-64",
                  style: { border: "1px solid #e2e8f0" },
                }}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="nationalId"
                className="block text-sm font-medium text-gray-700"
              >
                National ID
              </label>
              <input
                type="text"
                id="nationalId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={clearSignature}>
                Clear
              </Button>
              <Button onClick={handleConfirmDelivery}>Confirm Delivery</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
