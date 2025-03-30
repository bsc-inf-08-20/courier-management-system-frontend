"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import AgentList from "./AgentList";
import AssignAgent from "./UnassignedRequests";

interface PickupRequest {
  id: number;
  pickup_address: string;
  destination_address: string;
  status: string;
  assignedAgentUserId: number | null;
}

interface Props {
  requests: PickupRequest[];
  setRequests: (requests: PickupRequest[]) => void;
}

export default function PickupRequestList({ requests, setRequests }: Props) {
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pickup Address</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assign Agent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
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
              <TableCell>{request.status}</TableCell>
              <TableCell className="flex justify-between">
                <span>Click to view agents</span>
                {expandedRequest === request.id ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}
              </TableCell>
            </TableRow>

            {expandedRequest === request.id && (
              <TableRow>
                <TableCell colSpan={4} className="bg-gray-50">
                  <AgentList requestId={request.id} setRequests={setRequests} />
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
}
