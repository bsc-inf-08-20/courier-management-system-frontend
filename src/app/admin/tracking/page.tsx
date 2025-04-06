"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Packet {
  id: number;
  description: string;
  status: string;
  weight: number;
  category: string;
  origin_address: string;
  destination_address: string;
}

export default function Tracking() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/packets/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch packets");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setPackets(data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching packets:", error);
      toast.error("Failed to load packets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackets();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setPackets([]);
    fetchPackets(); // Now this will work
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Packet Management</h2>
        <Button onClick={handleRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading packets...</p>
        </div>
      ) : packets.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p>No packets found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packets.map((packet) => (
                <TableRow key={packet.id}>
                  <TableCell>{packet.id}</TableCell>
                  <TableCell className="font-medium">
                    {packet.description}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        packet.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : packet.status === "assigned"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {packet.status}
                    </span>
                  </TableCell>
                  <TableCell>{packet.weight}</TableCell>
                  <TableCell>{packet.category}</TableCell>
                  <TableCell>{packet.origin_address}</TableCell>
                  <TableCell>{packet.destination_address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
