// components/admin/UnassignedRequests.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface UnassignedRequestsProps {
  requests: PickupRequest[];
  agents: Agent[];
  adminCity: string;
  onAssignAgent: (requestId: number, agentId: number) => Promise<void>;
}

 export const UnassignedRequests = ({
  requests,
  agents,
  adminCity,
  onAssignAgent,
}: UnassignedRequestsProps) => {
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<{
    [key: number]: number | null;
  }>({});

  // Filter requests to only show unassigned ones from admin's city
  const filteredRequests = requests.filter(
    (req) =>
      req.status === "pending" &&
      !req.assigned_agent &&
      req.packet.origin_address.includes(adminCity)
  );

  const assignAgent = async (requestId: number) => {
    const agentId = assignments[requestId];
    if (!agentId) return;

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

export default UnassignedRequests;

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
