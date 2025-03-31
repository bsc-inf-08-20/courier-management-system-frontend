"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Customer {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  city: string;
}

interface Packet {
  id: number;
  description: string;
  status: string;
  weight: number;
  category: string;
  origin_address: string;
  destination_address: string;
  collected_at?: string;
}

interface PickupRequest {
  id: number;
  pickup_address: string;
  destination_address: string;
  status: string;
  created_at: string;
  customer: Customer;
  packet: Packet;
  assigned_agent?: Agent | null;
}

interface Agent {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  city: string;
}

const AgentPickupPage = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmCollectionId, setConfirmCollectionId] = useState<number | null>(null);
  const [weightDialogOpen, setWeightDialogOpen] = useState<number | null>(null);
  const [newWeight, setNewWeight] = useState<number | null>(null);
  const [agentCity, setAgentCity] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch agent data to get city
        const agentRes = await fetch("http://localhost:3001/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const agentData = await agentRes.json();
        setAgentCity(agentData.city);

        // Fetch assigned pickup requests for this agent
        const requestsRes = await fetch(
          `http://localhost:3001/pickup/requests?status=assigned&agentId=${agentData.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const requestsData = await requestsRes.json();
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConfirmCollection = async (pickupId: number, updatedWeight?: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3001/packets/${pickupId}/agent-confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ weight: updatedWeight }),
        }
      );

      if (res.ok) {
        toast.success("Packet collection confirmed.");
        const updatedRequests = requests.map((req) =>
          req.id === pickupId
            ? {
                ...req,
                packet: {
                  ...req.packet,
                  status: "collected",
                  weight: updatedWeight ?? req.packet.weight,
                  collected_at: new Date().toISOString(),
                },
              }
            : req
        );
        setRequests(updatedRequests);
      } else {
        throw new Error("Failed to confirm collection");
      }
    } catch (error) {
      console.error("Confirm collection error:", error);
      toast.error("Failed to confirm collection");
    } finally {
      setLoading(false);
      setConfirmCollectionId(null);
      setWeightDialogOpen(null);
      setNewWeight(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: "Pending", color: "bg-yellow-100 text-yellow-800" },
      assigned: { text: "Assigned", color: "bg-blue-100 text-blue-800" },
      collected: { text: "Collected", color: "bg-purple-100 text-purple-800" },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        My Assigned Pickups ({agentCity})
      </h2>

      {requests.length === 0 ? (
        <p className="text-center py-6">No assigned pickup requests</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pickup Address</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Packet</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="hover:bg-gray-100">
                <TableCell>{request.pickup_address}</TableCell>
                <TableCell>{request.customer.name}</TableCell>
                <TableCell>{request.customer.phone_number}</TableCell>
                <TableCell>{request.packet.description}</TableCell>
                <TableCell>{request.packet.weight} kg</TableCell>
                <TableCell>{getStatusBadge(request.packet.status)}</TableCell>
                <TableCell>
                  {request.packet.status === "assigned" && (
                    <Button
                      size="sm"
                      onClick={() => setWeightDialogOpen(request.id)}
                    >
                      Confirm Collection
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Weight Confirmation Dialog */}
      <Dialog
        open={weightDialogOpen !== null}
        onOpenChange={(open) => {
          if (!open) {
            setWeightDialogOpen(null);
            setNewWeight(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Packet Weight</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Current weight: {requests.find((r) => r.id === weightDialogOpen)?.packet.weight} kg
            </p>
            <Input
              type="number"
              placeholder="Enter new weight (if different)"
              value={newWeight ?? ""}
              onChange={(e) => setNewWeight(parseFloat(e.target.value))}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Leave blank to keep the current weight.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setWeightDialogOpen(null);
                setNewWeight(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setConfirmCollectionId(weightDialogOpen)}
              disabled={newWeight !== null && (newWeight <= 0 || isNaN(newWeight))}
            >
              Confirm Weight
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collection Confirmation Dialog */}
      <AlertDialog
        open={confirmCollectionId !== null}
        onOpenChange={(open) => !open && setConfirmCollectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Packet Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you have collected this packet?{" "}
              {newWeight && `The weight will be updated to ${newWeight} kg.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmCollection(confirmCollectionId!, newWeight ?? undefined)}
            >
              Confirm Collection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgentPickupPage;
