"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import PacketsToBeDelivered from "@/components/admin/delivery/PacketsToBeDelivered";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DeliveryPage = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [adminCity, setAdminCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<"to_be_assigned" | "assigned">(
    "to_be_assigned"
  );
  const [reassignPacketId, setReassignPacketId] = useState<number | null>(null);
  const [agentToRemove, setAgentToRemove] = useState<number | null>(null);
  const [expandedPacket, setExpandedPacket] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<{
    [key: number]: number | null;
  }>({});

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

        // Modify this section to fetch all relevant packets including delivered ones
        const [atDestinationRes, outForDeliveryRes, deliveredRes] =
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/packets/at-destination-hub?city=${adminData.city}&delivery_type=delivery`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/packets/out-for-delivery?city=${adminData.city}&delivery_type=delivery`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/packets/delivered?city=${adminData.city}&delivery_type=delivery`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);

        const atDestinationData = await atDestinationRes.json();
        const outForDeliveryData = await outForDeliveryRes.json();
        const deliveredData = await deliveredRes.json();

        const allPackets = [
          ...(Array.isArray(atDestinationData) ? atDestinationData : []),
          ...(Array.isArray(outForDeliveryData) ? outForDeliveryData : []),
          ...(Array.isArray(deliveredData) ? deliveredData : []),
        ].filter((packet) => packet.delivery_type === "delivery");

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
        setExpandedPacket(null); // Close the expanded view
        setAssignments({}); // Reset assignments
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
        setFilterType("to_be_assigned"); // Switch to first tab
        toast.success("Agent unassigned successfully.");
      } else {
        throw new Error("Failed to unassign agent");
      }
    } catch (error) {
      console.error("Error unassigning agent:", error);
      toast.error("Failed to unassign agent");
    } finally {
      setLoading(false);
      setAgentToRemove(null);
    }
  };

  const getUnassignedPackets = () => {
    return packets.filter(
      (packet) =>
        packet.status === "at_destination_hub" &&
        !packet.assigned_delivery_agent &&
        packet.delivery_type === "delivery"
    );
  };

  const getAssignedPackets = () => {
    return packets.filter(
      (packet) =>
        (packet.assigned_delivery_agent ||
          packet.status === "delivered" ||
          packet.status === "out_for_delivery") &&
        packet.delivery_type === "delivery"
    );
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Delivery Management ({adminCity})
      </h2>

      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={filterType === "to_be_assigned" ? "default" : "outline"}
          onClick={() => setFilterType("to_be_assigned")}
        >
          Packets to be Assigned
        </Button>
        <Button
          variant={filterType === "assigned" ? "default" : "outline"}
          onClick={() => setFilterType("assigned")}
        >
          Assigned Packets
        </Button>
      </div>

      {loading && packets.length === 0 ? (
        <p className="text-center py-6">Loading packets...</p>
      ) : packets.length === 0 ? (
        <p className="text-center py-6">No packets available</p>
      ) : filterType === "to_be_assigned" ? (
        // First tab - Unassigned packets
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getUnassignedPackets().map((packet) => (
              <>
                <TableRow key={packet.id}>
                  <TableCell>{packet.id}</TableCell>
                  <TableCell>{packet.description}</TableCell>
                  <TableCell>{packet.weight} kg</TableCell>
                  <TableCell>{packet.destination_address}</TableCell>
                  <TableCell>At Destination Hub</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => setExpandedPacket(packet.id)}
                    >
                      Assign Agent
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedPacket === packet.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-gray-50">
                      <div className="flex flex-wrap justify-center gap-4 p-4">
                        {agents.filter((a) => a.city === adminCity).length >
                        0 ? (
                          agents
                            .filter((a) => a.city === adminCity)
                            .map((agent) => (
                              <div
                                key={agent.user_id}
                                className="flex items-center gap-3 border p-2 rounded-lg shadow-sm w-full sm:w-2/4"
                              >
                                <div className="flex-1">
                                  <p className="font-semibold">{agent.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {agent.phone_number}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    assignAgent(packet.id, agent.user_id)
                                  }
                                >
                                  Select
                                </Button>
                              </div>
                            ))
                        ) : (
                          <p>No available agents in {adminCity}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      ) : (
        // Second tab - Assigned packets
        <PacketsToBeDelivered
          packets={getAssignedPackets()}
          adminCity={adminCity}
          onUnassignAgent={unassignAgent}
          onReassignAgent={assignAgent}
          setReassignPacketId={setReassignPacketId}
          setAgentToRemove={setAgentToRemove}
        />
      )}

      {/* Dialogs remain unchanged */}
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
                        setReassignPacketId(null); // Close the modal after reassignment
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
    </div>
  );
};

export default DeliveryPage;
