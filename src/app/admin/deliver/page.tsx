// DeliveryPage.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PacketsToBePickedUp from "@/components/admin/delivery/PacketsToBePickedUp";
import PacketsToBeDelivered from "@/components/admin/delivery/PacketsToBeDelivered";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Packet, Agent } from "@/types/types";

const DeliveryPage = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [adminCity, setAdminCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<
    "to_be_picked_up" | "to_be_delivered"
  >("to_be_picked_up");
  const [reassignPacketId, setReassignPacketId] = useState<number | null>(null);
  const [agentToRemove, setAgentToRemove] = useState<number | null>(null);
  const [confirmDeliveryId, setConfirmDeliveryId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);

    const fetchData = async () => {
      try {
        const adminRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const adminData = await adminRes.json();
        setAdminCity(adminData.city);

        const agentsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/agents?city=${adminData.city}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const agentsData = await agentsRes.json();
        setAgents(Array.isArray(agentsData) ? agentsData : []);

        const [atDestinationRes, outForDeliveryRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/packets/at-destination-hub?city=${adminData.city}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/packets/out-for-delivery?city=${adminData.city}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        const atDestinationData = await atDestinationRes.json();
        const outForDeliveryData = await outForDeliveryRes.json();

        const allPackets = [
          ...(Array.isArray(atDestinationData) ? atDestinationData : []),
          ...(Array.isArray(outForDeliveryData) ? outForDeliveryData : []),
        ];
        setPackets(allPackets);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const assignAgent = async (packetId: number, agentId: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // First assign the agent
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/assign-delivery-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ packetId, agentId }),
        }
      );

      if (res.ok) {
        const updatedPacket = await res.json();

        // Send notification
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/packets/notifications/delivery-assignment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ packetId }),
          }
        );

        setPackets((prev) =>
          prev.map((p) => (p.id === packetId ? updatedPacket : p))
        );
        toast.success("Agent assigned and notified successfully.");
      } else {
        throw new Error("Failed to assign agent");
      }
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast.error("Failed to assign agent");
    } finally {
      setLoading(false);
    }
  };

  const unassignAgent = async (packetId: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/unassign-delivery-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ packetId }),
        }
      );

      if (res.ok) {
        const updatedPacket = await res.json();
        setPackets((prev) =>
          prev.map((p) => (p.id === packetId ? updatedPacket : p))
        );
        toast.success("Agent unassigned successfully.");
      } else {
        throw new Error("Failed to unassign agent");
      }
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast.error("Failed to unassign agent");
    } finally {
      setLoading(false);
      setAgentToRemove(null);
    }
  };

  const confirmDelivery = async (packetId: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/packets/confirm-delivery`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ packetId }),
        }
      );

      if (res.ok) {
        const updatedPacket = await res.json();
        console.log(updatedPacket);
        setPackets(
          (prev) => prev.filter((p) => p.id !== packetId) // Remove delivered packet from list
        );
        toast.success("Delivery confirmed successfully.");
      } else {
        throw new Error("Failed to confirm delivery");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to confirm delivery");
    } finally {
      setLoading(false);
      setConfirmDeliveryId(null);
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Delivery Management ({adminCity})
      </h2>

      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={filterType === "to_be_picked_up" ? "default" : "outline"}
          onClick={() => setFilterType("to_be_picked_up")}
        >
          Packets to be Delivered
        </Button>
        <Button
          variant={filterType === "to_be_delivered" ? "default" : "outline"}
          onClick={() => setFilterType("to_be_delivered")}
        >
          Packets to be Picked Up
        </Button>
      </div>

      {loading && packets.length === 0 ? (
        <p className="text-center py-6">Loading packets...</p>
      ) : packets.length === 0 ? (
        <p className="text-center py-6">No packets available</p>
      ) : filterType === "to_be_picked_up" ? (
        <PacketsToBePickedUp
          packets={packets}
          agents={agents}
          adminCity={adminCity}
          onAssignAgent={assignAgent}
        />
      ) : (
        <PacketsToBeDelivered
          packets={packets}
          adminCity={adminCity}
          onUnassignAgent={unassignAgent}
          onReassignAgent={assignAgent}
          onConfirmDelivery={confirmDelivery}
          setReassignPacketId={setReassignPacketId}
          setConfirmDeliveryId={setConfirmDeliveryId}
          setAgentToRemove={setAgentToRemove}
        />
      )}

      {/* Reassign Modal */}
      <Dialog
        open={reassignPacketId !== null}
        onOpenChange={(open) => !open && setReassignPacketId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {agents
              .filter((a) => a.city === adminCity)
              .map((agent) => (
                <div
                  key={agent.user_id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-600">
                      {agent.phone_number}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (reassignPacketId) {
                        assignAgent(reassignPacketId, agent.user_id);
                      }
                    }}
                  >
                    Select
                  </Button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Agent Confirmation */}
      <AlertDialog
        open={agentToRemove !== null}
        onOpenChange={(open) => !open && setAgentToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the assigned agent from this
              packet?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => unassignAgent(agentToRemove!)}>
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delivery Dialog */}
      <AlertDialog
        open={confirmDeliveryId !== null}
        onOpenChange={(open) => !open && setConfirmDeliveryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delivery</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure this packet has been delivered to the recipient?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelivery(confirmDeliveryId!)}
            >
              Confirm Delivery
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeliveryPage;
