"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignaturePad from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Packet } from "@/types/types";
import AwaitingPickupTable from "@/components/admin/hub/AwaitingPickupTable";
import PickedUpTable from "@/components/admin/hub/PickedUpTable";

export default function HubPickupPage() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [, setLoading] = useState(true);
  const [adminCity, setAdminCity] = useState("");
  const [currentPacketId, setCurrentPacketId] = useState<number | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [nationalId, setNationalId] = useState<string>("");
  const signaturePadRef = useRef<SignaturePad>(null);

  useEffect(() => {
    fetchPackets();
  }, []);

  const fetchPackets = async () => {
    const token = localStorage.getItem("token");
    try {
      // Fetch admin's city
      const adminRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const adminData = await adminRes.json();
      setAdminCity(adminData.city);

      // Fetch packets
      const packetsRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets?city=${adminData.city}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const packetsData = await packetsRes.json();
      setPackets(Array.isArray(packetsData) ? packetsData : []);
    } catch (error) {
      console.error("Error fetching packets:", error);
      toast.error("Failed to load packets");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async (): Promise<void> => {
    if (!currentPacketId || !signaturePadRef.current) return;

    const token = localStorage.getItem("token");
    try {
      const signatureBase64 = signaturePadRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

      setPackets((prev) =>
        prev.map((packet) =>
          packet.id === currentPacketId
            ? {
                ...packet,
                status: "delivered",
                signature_base64: signatureBase64,
              }
            : packet
        )
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/${currentPacketId}/picked`,
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

      // Send pickup confirmation notification
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/notifications/pickup-confirmation`,
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

      toast.success("Package marked as picked up and confirmation email sent");
      setIsSignatureModalOpen(false);
      setNationalId(""); // Clear the national ID after successful submission
    } catch (error) {
      console.error("Error marking as picked up:", error);
      toast.error("Failed to update pickup status");
      setPackets((prev) =>
        prev.map((packet) =>
          packet.id === currentPacketId
            ? { ...packet, status: "at_destination_hub", signature_base64: undefined }
            : packet
        )
      );
    }
  };

  const getAwaitingPickupPackets = () => {
    return packets.filter(
      (packet) =>
        packet.delivery_type === "pickup" &&
        packet.status === "at_destination_hub" &&
        packet.destination_hub === adminCity
    );
  };

  const getPickedUpPackets = () => {
    return packets.filter(
      (packet) =>
        packet.delivery_type === "pickup" &&
        packet.status === "delivered" &&
        packet.destination_hub === adminCity
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Hub Pickup Management ({adminCity})</h2>

      <Tabs defaultValue="awaiting" className="space-y-4">
        <TabsList>
          <TabsTrigger value="awaiting">Awaiting Pickup</TabsTrigger>
          <TabsTrigger value="picked">Picked Up</TabsTrigger>
        </TabsList>

        <TabsContent value="awaiting">
          <AwaitingPickupTable
            packets={getAwaitingPickupPackets()}
            onConfirmPickup={(packetId) => {
              setCurrentPacketId(packetId);
              setIsSignatureModalOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="picked">
          <PickedUpTable packets={getPickedUpPackets()} />
        </TabsContent>
      </Tabs>

      {/* Signature Modal */}
      <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Signature Required</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-4 bg-white">
            <SignaturePad
              ref={signaturePadRef}
              canvasProps={{
                className: "border rounded-lg w-full h-64",
              }}
            />
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
            <div className="mt-4 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => signaturePadRef.current?.clear()}
              >
                Clear
              </Button>
              <Button onClick={handleConfirmPickup}>Confirm Pickup</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}