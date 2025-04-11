"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Packet {
  id: number;
  description: string;
  status: string;
  weight: number;
  category: string;
  origin_address: string;
  destination_address: string;
  collected_at?: string | null;
  origin_hub_confirmed_at?: string | null;
  dispatched_at?: string;
  destination_hub_confirmed_at?: string | null;
  out_for_delivery_at?: string | null;
  delivered_at?: string | null;
  received_at?: string | null;
  hub_confirmed_at?: string | null;
  confirmed_by_origin: boolean;
  assigned_driver?: {
    user_id: number;
    name: string;
    phone_number: string;
    email: string;
  } | null;
  assigned_vehicle?: {
    id: number;
    make: string;
    model: string;
    license_plate: string;
    // Add assigned_driver here if API is updated
    assigned_driver?: {
      user_id: number;
      name: string;
      phone_number: string;
      email: string;
    } | null;
  } | null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

const ReceivePacketsPage = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [adminCity, setAdminCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found");
        toast.error("Please log in first");
        return;
      }

      try {
        const adminRes = await fetch("http://localhost:3001/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!adminRes.ok) {
          const errorData = await adminRes.json();
          throw new Error(errorData.message || "Failed to fetch admin data");
        }
        const adminData = await adminRes.json();
        setAdminCity(adminData.city || "");

        const packetsRes = await fetch(
          `http://localhost:3001/packets/in-transit/incoming?origin=${adminData.city}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!packetsRes.ok) {
          const errorData = await packetsRes.json();
          throw new Error(errorData.message || "Failed to fetch packets");
        }

        const packetsData = await packetsRes.json();
        const packetsArray = Array.isArray(packetsData)
          ? packetsData
          : Array.isArray(packetsData?.data)
          ? packetsData.data
          : [];

        const incomingPackets = packetsArray.filter(
          (packet: Packet) =>
            packet.status === "in_transit" &&
            packet.confirmed_by_origin === true &&
            packet.destination_address?.includes(adminData.city)
        );

        setPackets(incomingPackets);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(getErrorMessage(error));
        setPackets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const confirmReceipt = async () => {
    if (!selectedPacket) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/packets/${selectedPacket}/destination-hub-confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm receipt");
      }

      toast.success("Packet received successfully");
      setPackets(packets.filter((p) => p.id !== selectedPacket));
      setSelectedPacket(null);
    } catch (error) {
      console.error("Receipt confirmation error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setShowConfirmationDialog(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      in_transit: { text: "In Transit", color: "bg-blue-100 text-blue-800" },
      at_destination_hub: {
        text: "At Destination Hub",
        color: "bg-green-100 text-green-800",
      },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Incoming Packages ({adminCity || "Loading..."})
      </h2>

      {loading && packets.length === 0 ? (
        <p className="text-center py-6">Loading incoming packets...</p>
      ) : packets.length === 0 ? (
        <p className="text-center py-6">No incoming packets to receive</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Dispatched At</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packets.map((packet) => (
                <TableRow
                  key={`incoming-${packet.id}`}
                  className="hover:bg-gray-50"
                >
                  <TableCell>{packet.id}</TableCell>
                  <TableCell>{packet.description || "N/A"}</TableCell>
                  <TableCell>{packet.weight || 0} kg</TableCell>
                  <TableCell>{packet.origin_address || "N/A"}</TableCell>
                  <TableCell>{formatDate(packet.dispatched_at)}</TableCell>
                  <TableCell>
                    {packet.assigned_vehicle?.assigned_driver ? (
                      <div>
                        <p>{packet.assigned_vehicle.assigned_driver.name}</p>
                        <p className="text-sm text-gray-600">
                          {packet.assigned_vehicle.assigned_driver.phone_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {packet.assigned_vehicle.assigned_driver.email}
                        </p>
                      </div>
                    ) : packet.assigned_driver ? (
                      <div>
                        <p>{packet.assigned_driver.name}</p>
                        <p className="text-sm text-gray-600">
                          {packet.assigned_driver.phone_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {packet.assigned_driver.email}
                        </p>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {packet.assigned_vehicle
                      ? `${packet.assigned_vehicle.make} ${packet.assigned_vehicle.model} (${packet.assigned_vehicle.license_plate})`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{getStatusBadge(packet.status || "")}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setSelectedPacket(packet.id);
                        setShowConfirmationDialog(true);
                      }}
                      disabled={loading}
                    >
                      Confirm Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Package Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm receipt of this package? This
              will update its status to "At Destination Hub".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReceipt} disabled={loading}>
              {loading ? "Processing..." : "Confirm Receipt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReceivePacketsPage;
