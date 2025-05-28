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
  origin_city: string;
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

const AgentPickupPage = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmCollectionId, setConfirmCollectionId] = useState<number | null>(
    null
  );
  const [weightDialogOpen, setWeightDialogOpen] = useState<number | null>(null);
  const [newWeight, setNewWeight] = useState<number | null>(null);
  const [editingWeightId, setEditingWeightId] = useState<number | null>(null);
  const [editingWeightValue, setEditingWeightValue] = useState<number>(0);
  const [agentCity, setAgentCity] = useState<string>("");
  const [agentId, setAgentId] = useState<number | null>(null);
  const [confirmCollectedId, setConfirmCollectedId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchAgentData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch agent info
        const agentRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/me-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!agentRes.ok) {
          const errorData = await agentRes.json();
          throw new Error(errorData.message || "Failed to fetch agent info");
        }

        const agentData = await agentRes.json();
        setAgentCity(agentData.city);
        setAgentId(agentData.user_id);

        // Fetch requests with valid agentId
        const requestsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/pickup/requests/agent?status=assigned&agentId=${agentData.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!requestsRes.ok) {
          const errorData = await requestsRes.json();
          throw new Error(errorData.message || "Failed to fetch requests");
        }

        const data = await requestsRes.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  const handleUpdateWeight = async (packetId: number) => {
    if (!agentId) {
      toast.error("Agent ID not found");
      return;
    }

    if (editingWeightValue <= 0) {
      toast.error("Weight must be greater than 0");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/${packetId}/weight`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            weight: editingWeightValue,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update weight");
      }

      toast.success("Packet weight updated successfully.");
      // Update local state
      const updatedRequests = requests.map((req) =>
        req.packet.id === packetId
          ? {
              ...req,
              packet: {
                ...req.packet,
                weight: editingWeightValue,
              },
            }
          : req
      );
      setRequests(updatedRequests);
      setEditingWeightId(null);
    } catch (error) {
      console.error("Update weight error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCollection = async (pickupId: number) => {
    if (!agentId) {
      toast.error("Agent ID not found");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/${pickupId}/agent-confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            weight: newWeight !== null ? newWeight : undefined,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to confirm collection");
      }

      toast.success("Packet collection confirmed.");
      // Update local state
      const updatedRequests = requests.map((req) =>
        req.id === pickupId
          ? {
              ...req,
              packet: {
                ...req.packet,
                status: "collected",
                weight: newWeight ?? req.packet.weight,
                collected_at: new Date().toISOString(),
              },
            }
          : req
      );
      setRequests(updatedRequests);
    } catch (error) {
      console.error("Confirm collection error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setConfirmCollectionId(null);
      setWeightDialogOpen(null);
      setNewWeight(null);
    }
  };

  const handleMarkAsCollected = async (pickupId: number) => {
    // Find the request and get the packet ID
    const request = requests.find((req) => req.id === pickupId);
    if (!request) {
      toast.error("Request not found");
      return;
    }

    const packetId = request.packet.id;

    if (!agentId) {
      toast.error("Agent ID not found");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/${packetId}/agent-confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to confirm collection");
      }

      toast.success("Packet marked as collected.");
      // Update local state
      const updatedRequests = requests.map((req) =>
        req.id === pickupId
          ? {
              ...req,
              packet: {
                ...req.packet,
                status: "collected",
                collected_at: new Date().toISOString(),
              },
            }
          : req
      );
      setRequests(updatedRequests);
    } catch (error) {
      console.error("Confirm collection error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setConfirmCollectedId(null);
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

      {loading && requests.length === 0 ? (
        <p className="text-center py-6">Loading assigned pickups...</p>
      ) : requests.length === 0 ? (
        <p className="text-center py-6">No assigned pickup requests</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pickup Address</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Packet</TableHead>
              <TableHead>Weight (kg)</TableHead>
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    {request.packet.weight}
                    {request.packet.status !== "collected" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingWeightId(request.packet.id);
                          setEditingWeightValue(request.packet.weight);
                        }}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(request.packet.status)}</TableCell>
                <TableCell className="flex gap-2">
                  {request.packet.status === "assigned" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setWeightDialogOpen(request.id);
                        setNewWeight(null);
                      }}
                      disabled={loading}
                    >
                      Confirm Collection
                    </Button>
                  )}
                  {request.packet.status === "collected" ? (
                    <Button size="sm" variant="outline" disabled>
                      Collected
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setConfirmCollectedId(request.id)}
                      disabled={loading}
                    >
                      Mark as Collected
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Weight Editing Dialog */}
      <Dialog
        open={editingWeightId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingWeightId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Packet Weight</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              type="number"
              placeholder="Enter weight in kg"
              value={editingWeightValue}
              onChange={(e) =>
                setEditingWeightValue(parseFloat(e.target.value))
              }
              min="0.1"
              step="0.1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingWeightId(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleUpdateWeight(editingWeightId!)}
              disabled={loading || editingWeightValue <= 0}
            >
              {loading ? "Saving..." : "Save Weight"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collection Confirmation Dialog */}
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
            <DialogTitle>Confirm Packet Collection</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="font-medium">Current Weight:</p>
              <p className="text-lg">
                {requests.find((r) => r.id === weightDialogOpen)?.packet.weight}{" "}
                kg
              </p>
            </div>

            <div>
              <p className="font-medium">Update Weight (if different):</p>
              <Input
                type="number"
                placeholder="Enter new weight in kg"
                value={newWeight ?? ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setNewWeight(isNaN(value) ? null : value);
                }}
                min="0.1"
                step="0.1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave blank to keep current weight
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setWeightDialogOpen(null);
                setNewWeight(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const request = requests.find((r) => r.id === weightDialogOpen);
                if (request) {
                  setConfirmCollectionId(request.id);
                }
              }}
              disabled={loading || (newWeight !== null && newWeight <= 0)}
            >
              {loading ? "Processing..." : "Continue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <AlertDialog
        open={confirmCollectionId !== null}
        onOpenChange={(open) => !open && setConfirmCollectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              {newWeight !== null ? (
                <>
                  You are about to confirm collection and update the weight to{" "}
                  <strong>{newWeight} kg</strong>. This action cannot be undone.
                </>
              ) : (
                "You are about to confirm collection with the current weight. This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmCollection(confirmCollectionId!)}
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm Collection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Collected Confirmation Dialog */}
      <AlertDialog
        open={confirmCollectedId !== null}
        onOpenChange={(open) => !open && setConfirmCollectedId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Packet Collected</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure the parcel has been collected?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleMarkAsCollected(confirmCollectedId!)}
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default AgentPickupPage;
