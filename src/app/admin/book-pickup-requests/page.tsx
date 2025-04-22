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
import { ChevronDown, ChevronUp } from "lucide-react";
import { AgentActionsDropdown } from "@/components/admin/AgentActionsDropdown";
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

const UnassignedRequests = ({
  requests,
  agents,
  adminCity,
  onAssignAgent,
}: {
  requests: PickupRequest[];
  agents: Agent[];
  adminCity: string;
  onAssignAgent: (requestId: number, agentId: number) => Promise<void>;
}) => {
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<{
    [key: number]: number | null;
  }>({});

  const filteredRequests = requests.filter(
    (req) =>
      req.status === "pending" &&
      !req.assigned_agent &&
      req.packet.origin_address.includes(adminCity)
  );

  const assignAgent = async (requestId: number) => {
    const agentId = assignments[requestId];
    if (!agentId) {
      toast.error("Please select an agent first.");
      return;
    }
    await onAssignAgent(requestId, agentId);
    setExpandedRequest(null);
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pickup Address</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Packet</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((request) => (
            <>
              <TableRow
                key={request.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  setExpandedRequest(
                    expandedRequest === request.id ? null : request.id
                  )
                }
              >
                <TableCell>{request.pickup_address}</TableCell>
                <TableCell>{request.destination_address}</TableCell>
                <TableCell>
                  {request.customer.name} <br />
                  {request.customer.phone_number}
                </TableCell>
                <TableCell>
                  {request.packet.description} ({request.packet.weight} kg)
                </TableCell>
                <TableCell>Pending</TableCell>
                <TableCell>
                  <div className="flex justify-between">
                    <span>Click to assign agent</span>
                    {expandedRequest === request.id ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>
                </TableCell>
              </TableRow>

              {expandedRequest === request.id && (
                <TableRow key={`agents-${request.id}`}>
                  <TableCell colSpan={6} className="bg-gray-50">
                    <div className="flex flex-wrap justify-center gap-4 p-4">
                      {agents.filter((a) => a.city === adminCity).length > 0 ? (
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
                                  setAssignments({
                                    ...assignments,
                                    [request.id]: agent.user_id,
                                  })
                                }
                                variant={
                                  assignments[request.id] === agent.user_id
                                    ? "default"
                                    : "outline"
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
                    <div className="p-4 flex justify-center">
                      <Button
                        onClick={() => assignAgent(request.id)}
                        disabled={!assignments[request.id]}
                      >
                        Assign Agent
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const BookPickupRequestsPage = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [, setLoading] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState<PickupRequest[]>([]);
  const [filterType, setFilterType] = useState<
    "unassigned" | "assigned" | "collected" | "delivered"
  >("unassigned");
  const [reassignRequestId, setReassignRequestId] = useState<number | null>(
    null
  );
  const [agentToRemove, setAgentToRemove] = useState<number | null>(null);
  const [confirmHubArrivalId, setConfirmHubArrivalId] = useState<number | null>(
    null
  );
  const [adminCity, setAdminCity] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);

    const fetchData = async () => {
      try {
        const adminRes = await fetch("http://localhost:3001/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const adminData = await adminRes.json();
        setAdminCity(adminData.city);

        const agentsRes = await fetch(
          `http://localhost:3001/users/agents?city=${adminData.city}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const agentsData = await agentsRes.json();
        if (Array.isArray(agentsData)) {
          setAgents(agentsData);
        } else if (agentsData.data && Array.isArray(agentsData.data)) {
          setAgents(agentsData.data);
        } else if (agentsData.users && Array.isArray(agentsData.users)) {
          setAgents(agentsData.users);
        } else {
          console.warn("Unexpected agents response structure:", agentsData);
          setAgents([]);
        }

        const requestsRes = await fetch(
          `http://localhost:3001/pickup/requests?city=${adminData.city}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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

  const filterRequests = (
    type: "unassigned" | "assigned" | "collected" | "delivered",
    data?: PickupRequest[]
  ) => {
    const requestData = data || requests;
    let filtered: PickupRequest[] = [];

    if (type === "unassigned") {
      filtered = requestData.filter(
        (req) =>
          req.status === "pending" &&
          !req.assigned_agent &&
          req.packet.origin_address.includes(adminCity)
      );
    } else if (type === "assigned") {
      filtered = requestData.filter(
        (req) =>
          req.status === "assigned" &&
          req.packet.status === "pending" &&
          req.assigned_agent?.city === adminCity
      );
    } else if (type === "collected") {
      filtered = requestData.filter(
        (req) =>
          req.packet.status === "collected" &&
          req.assigned_agent?.city === adminCity
      );
    } else if (type === "delivered") {
      filtered = requestData.filter(
        (req) =>
          req.packet.status === "at_origin_hub" &&
          req.packet.origin_address.includes(adminCity)
      );
    }

    setFilteredRequests(filtered);
    setFilterType(type);
  };

  const assignAgent = async (requestId: number, agentId: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3001/pickup/${requestId}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ agentId }),
        }
      );

      if (res.ok) {
        toast.success("Agent assigned successfully.");
        const updatedRequests = requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                assigned_agent: agents.find((a) => a.user_id === agentId),
                status: "assigned",
              }
            : req
        );
        setRequests(updatedRequests);
        filterRequests(filterType, updatedRequests);
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

  const confirmRemoveAgent = async () => {
    if (!agentToRemove) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3001/pickup/${agentToRemove}/unassign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assignedAgentUserId: null,
            status: "pending",
          }),
        }
      );

      if (res.ok) {
        toast.success("Agent removed successfully.");
        const updatedRequests = requests.map((req) =>
          req.id === agentToRemove
            ? {
                ...req,
                assigned_agent: null,
                status: "pending",
              }
            : req
        );
        setRequests(updatedRequests);
        filterRequests(filterType, updatedRequests);
      } else {
        throw new Error("Failed to remove agent");
      }
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast.error("Failed to remove agent");
    } finally {
      setLoading(false);
      setAgentToRemove(null);
    }
  };

  const confirmHubArrival = async () => {
    if (!confirmHubArrivalId) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3001/pickup/${confirmHubArrivalId}/deliver`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        toast.success("Packet confirmed at hub.");
        const updatedRequests = requests.map((req) =>
          req.id === confirmHubArrivalId
            ? {
                ...req,
                packet: {
                  ...req.packet,
                  status: "at_origin_hub",
                },
              }
            : req
        );
        setRequests(updatedRequests);
        filterRequests(filterType, updatedRequests);
      } else {
        throw new Error("Failed to confirm hub arrival");
      }
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast.error("Failed to confirm hub arrival");
    } finally {
      setLoading(false);
      setConfirmHubArrivalId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: "Pending", color: "bg-yellow-100 text-yellow-800" },
      assigned: { text: "Assigned", color: "bg-blue-100 text-blue-800" },
      collected: { text: "Collected", color: "bg-purple-100 text-purple-800" },
      at_origin_hub: { text: "At Hub", color: "bg-green-100 text-green-800" },
      in_transit: {
        text: "In Transit",
        color: "bg-indigo-100 text-indigo-800",
      },
      delivered: { text: "Delivered", color: "bg-green-100 text-green-800" },
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
        Book Pickup Requests ({adminCity})
      </h2>

      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={filterType === "unassigned" ? "default" : "outline"}
          onClick={() => filterRequests("unassigned")}
        >
          Unassigned Requests
        </Button>
        <Button
          variant={filterType === "assigned" ? "default" : "outline"}
          onClick={() => filterRequests("assigned")}
        >
          Assigned Requests
        </Button>
        <Button
          variant={filterType === "collected" ? "default" : "outline"}
          onClick={() => filterRequests("collected")}
        >
          Collected Requests
        </Button>
        <Button
          variant={filterType === "delivered" ? "default" : "outline"}
          onClick={() => filterRequests("delivered")}
        >
          Delivered Requests
        </Button>
      </div>

      {filterType === "unassigned" ? (
        <UnassignedRequests
          requests={requests}
          agents={agents}
          adminCity={adminCity}
          onAssignAgent={assignAgent}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pickup Address</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Packet</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agent</TableHead>
              {(filterType === "assigned" || filterType === "collected") && (
                <TableHead>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id} className="hover:bg-gray-100">
                <TableCell>{request.pickup_address}</TableCell>
                <TableCell>{request.destination_address}</TableCell>
                <TableCell>
                  {request.customer.name} <br />
                  {request.customer.phone_number}
                </TableCell>
                <TableCell>
                  {request.packet.description} ({request.packet.weight} kg)
                  {request.packet.status === "collected" &&
                    request.packet.collected_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Collected at:{" "}
                        {new Date(request.packet.collected_at).toLocaleString()}
                      </div>
                    )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(request.packet.status)}
                  {request.status === "assigned" && request.assigned_agent && (
                    <div className="text-xs text-gray-500 mt-1">
                      Assigned to: {request.assigned_agent.name}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {request.assigned_agent ? (
                    <div>
                      <p className="font-medium">
                        {request.assigned_agent.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.assigned_agent.phone_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.assigned_agent.city}
                      </p>
                    </div>
                  ) : (
                    "No agent assigned"
                  )}
                </TableCell>
                {(filterType === "assigned" || filterType === "collected") && (
                  <TableCell>
                    <div className="flex gap-2">
                      {filterType === "assigned" && (
                        <AgentActionsDropdown
                          onRemove={() => setAgentToRemove(request.id)}
                          onReassign={() => setReassignRequestId(request.id)}
                        />
                      )}
                      {filterType === "collected" && (
                        <Button
                          size="sm"
                          onClick={() => setConfirmHubArrivalId(request.id)}
                        >
                          Confirm Hub Arrival
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Reassign Modal */}
      <Dialog
        open={reassignRequestId !== null}
        onOpenChange={(open) => !open && setReassignRequestId(null)}
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
                      if (reassignRequestId) {
                        assignAgent(reassignRequestId, agent.user_id);
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
              request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveAgent}>
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Hub Arrival Dialog */}
      <AlertDialog
        open={confirmHubArrivalId !== null}
        onOpenChange={(open) => !open && setConfirmHubArrivalId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Hub Arrival</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure this packet has arrived at the hub?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmHubArrival}>
              Confirm Arrival
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookPickupRequestsPage;
