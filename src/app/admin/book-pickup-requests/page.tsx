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
  DialogTitle, // Add this import
} from "@/components/ui/dialog";

interface Customer {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
}

interface Packet {
  id: number;
  description: string;
  status: string;
  weight: number;
  category: string;
  origin_address: string;
  destination_address: string;
}

interface PickupRequest {
  id: number;
  pickup_address: string;
  destination_address: string;
  status: string;
  created_at: string;
  customer: Customer;
  packet: Packet;
  assignedAgentUserId: number | null;
  assigned_agent?: Agent | null;
}

interface Agent {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
}

export default function BookPickupRequestsPage() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<{
    [key: number]: number | null;
  }>({});
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [filteredRequests, setFilteredRequests] = useState<PickupRequest[]>([]);
  const [filterType, setFilterType] = useState<
    "unassigned" | "assigned" | "delivered"
  >("unassigned");
  const [reassignRequestId, setReassignRequestId] = useState<number | null>(
    null
  );
  const [agentToRemove, setAgentToRemove] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);

    fetch("http://localhost:3001/pickup/requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRequests(data);
          filterRequests(filterType, data);
        }
      });

    fetch("http://localhost:3001/users/role/agent", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filterRequests = (
    type: "unassigned" | "assigned" | "delivered",
    data?: PickupRequest[]
  ) => {
    const requestData = data || requests;
    let filtered: PickupRequest[] = [];

    if (type === "unassigned") {
      filtered = requestData.filter(
        (req) => req.status === "pending" && !req.assignedAgentUserId
      );
    } else if (type === "assigned") {
      filtered = requestData.filter((req) => req.status === "assigned");
    } else if (type === "delivered") {
      filtered = requestData.filter((req) => req.status === "delivered");
    }

    setFilteredRequests(filtered);
    setFilterType(type);
  };

  const assignAgent = async (requestId: number, agentId?: number) => {
    const agentToAssign = agentId ?? assignments[requestId];
    if (!agentToAssign) return;

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
          body: JSON.stringify({ assignedAgentUserId: agentToAssign }),
        }
      );

      if (res.ok) {
        toast.success("Agent assigned successfully.");
        const updatedRequests = requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                assignedAgentUserId: agentToAssign,
                assigned_agent: agents.find((a) => a.user_id === agentToAssign),
                status: "assigned",
              }
            : req
        );
        setRequests(updatedRequests);
        filterRequests(filterType, updatedRequests);
        setReassignRequestId(null);
      }
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
            assignedAgentUserId: null,  // Explicitly set to null
            status: "pending"          // Reset status to pending
          }),
        }
      );
  
      if (res.ok) {
        toast.success("Agent removed successfully.");
        const updatedRequests = requests.map((req) =>
          req.id === agentToRemove
            ? {
                ...req,
                assignedAgentUserId: null,
                assigned_agent: null,
                status: "pending",  // Ensure status is updated
              }
            : req
        );
        setRequests(updatedRequests);
        filterRequests(filterType, updatedRequests);
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to remove agent");
      }
    } catch (error) {
      console.error("Failed to remove agent", error);
      toast.error("Failed to remove agent.");
    } finally {
      setLoading(false);
      setAgentToRemove(null);
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Book Pickup Requests
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
          variant={filterType === "delivered" ? "default" : "outline"}
          onClick={() => filterRequests("delivered")}
        >
          Delivered Requests
        </Button>
      </div>

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
                onClick={() => {
                  if (filterType === "unassigned") {
                    setExpandedRequest(
                      expandedRequest === request.id ? null : request.id
                    );
                  }
                }}
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
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  {filterType === "unassigned" ? (
                    <div className="flex justify-between">
                      <span>Click to assign agent</span>
                      {expandedRequest === request.id ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </div>
                  ) : request.assigned_agent ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {request.assigned_agent.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.assigned_agent.phone_number}
                        </p>
                      </div>
                      {filterType === "assigned" && (
                        <AgentActionsDropdown
                          onRemove={() => setAgentToRemove(request.id)}
                          onReassign={() => setReassignRequestId(request.id)}
                        />
                      )}
                    </div>
                  ) : (
                    "No agent assigned"
                  )}
                </TableCell>
              </TableRow>

              {filterType === "unassigned" &&
                expandedRequest === request.id && (
                  <TableRow key={`agents-${request.id}`}>
                    <TableCell colSpan={6} className="bg-gray-50">
                      <div className="flex flex-wrap justify-center gap-4 p-4">
                        {agents.length > 0 ? (
                          agents.map((agent) => (
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
                          <p>No available agents</p>
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

      {/* Reassign Modal */}
      <Dialog
        open={reassignRequestId !== null}
        onOpenChange={(open: boolean) => !open && setReassignRequestId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {agents.map((agent) => (
              <div
                key={agent.user_id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-gray-600">{agent.phone_number}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (reassignRequestId) {
                      assignAgent(reassignRequestId, agent.user_id);
                    }
                  }}
                  variant={
                    assignments[reassignRequestId || 0] === agent.user_id
                      ? "default"
                      : "outline"
                  }
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={agentToRemove !== null}
        onOpenChange={(open: boolean) => !open && setAgentToRemove(null)}
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
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { toast } from "sonner";
// import { ChevronDown, ChevronUp } from "lucide-react";

// interface Customer {
//   user_id: number;
//   name: string;
//   email: string;
//   phone_number: string;
//   address: string;
// }

// interface Packet {
//   id: number;
//   description: string;
//   status: string;
//   weight: number;
//   category: string;
//   origin_address: string;
//   destination_address: string;
// }

// interface PickupRequest {
//   id: number;
//   pickup_address: string;
//   destination_address: string;
//   status: string;
//   created_at: string;
//   customer: Customer;
//   packet: Packet;
//   assignedAgentUserId: number | null;
// }

// interface Agent {
//   user_id: number;
//   name: string;
//   email: string;
//   phone_number: string;
//   address: string;
// }

// export default function BookPickupRequestsPage() {
//   const [requests, setRequests] = useState<PickupRequest[]>([]);
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [assignments, setAssignments] = useState<{
//     [key: number]: number | null;
//   }>({});
//   const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
//   const [mounted, setMounted] = useState(false); // Prevents hydration mismatch

//   useEffect(() => {
//     setMounted(true); // Ensures client-side rendering
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setLoading(true);

//     // Fetch Pickup Requests
//     fetch("http://localhost:3001/pickup/requests", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("API Response:", data); // Debugging API Response
//         if (Array.isArray(data)) {
//           setRequests(data);
//         } else {
//           console.error("Unexpected API response:", data);
//           setRequests([]);
//         }
//       })
//       .catch((err) => {
//         console.error("Failed to fetch pickup requests", err);
//         setRequests([]);
//       })
//       .finally(() => setLoading(false));

//     // Fetch Available Agents
//     fetch("http://localhost:3001/users/role/agent", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (Array.isArray(data)) {
//           setAgents(data);
//         } else {
//           console.error("Unexpected API response for agents:", data);
//           setAgents([]);
//         }
//       })
//       .catch((err) => {
//         console.error("Failed to fetch agents", err);
//         setAgents([]);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   // Assign agent to request
//   const assignAgent = async (requestId: number) => {
//     const agentId = assignments[requestId];

//     if (!agentId) {
//       toast.error("Please select an agent first.");
//       return;
//     }

//     setLoading(true);
//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch(
//         `http://localhost:3001/pickup/${requestId}/assign`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ assignedAgentUserId: agentId }),
//         }
//       );

//       if (res.ok) {
//         toast.success("Agent assigned successfully.");
//         setRequests(
//           requests.map((req) =>
//             req.id === requestId
//               ? { ...req, assignedAgentUserId: agentId, status: "assigned" }
//               : req
//           )
//         );
//         setExpandedRequest(null); // Close dropdown after assigning
//       } else {
//         toast.error("Failed to assign agent.");
//       }
//     } catch (error) {
//       console.error("Failed to assign agent", error);
//       toast.error("Failed to assign agent.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!mounted) return <div>Loading...</div>; // Prevents hydration error

//   return (
//     <div className="p-6 w-full">
//       <h2 className="text-2xl font-bold mb-4">Book Pickup Requests</h2>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Pickup Address</TableHead>
//             <TableHead>Destination</TableHead>
//             <TableHead>Customer</TableHead>
//             <TableHead>Packet</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Assign Agent</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {requests.map((request) => (
//             <>
//               {/* Request Row */}
//               <TableRow
//                 key={request.id}
//                 className="cursor-pointer hover:bg-gray-100"
//                 onClick={() =>
//                   setExpandedRequest(
//                     expandedRequest === request.id ? null : request.id
//                   )
//                 }
//               >
//                 <TableCell>{request.pickup_address}</TableCell>
//                 <TableCell>{request.destination_address}</TableCell>
//                 <TableCell>
//                   {request.customer.name} <br />
//                   {request.customer.phone_number}
//                 </TableCell>
//                 <TableCell>
//                   {request.packet.description} ({request.packet.weight} kg)
//                 </TableCell>
//                 <TableCell>{request.status}</TableCell>
//                 <TableCell className="flex justify-between">
//                   <span>Click to view agents</span>
//                   {expandedRequest === request.id ? (
//                     <ChevronUp />
//                   ) : (
//                     <ChevronDown />
//                   )}
//                 </TableCell>
//               </TableRow>

//               {/* Agent Dropdown */}
//               {expandedRequest === request.id && (
//                 <TableRow key={`agents-${request.id}`}>
//                   <TableCell colSpan={6} className="bg-gray-50">
//                     <div className="flex flex-wrap justify-center gap-4 p-4">
//                       {agents.length > 0 ? (
//                         agents.map((agent) => (
//                           <div
//                             key={agent.user_id}
//                             className="flex items-center gap-3 border p-2 rounded-lg shadow-sm w-full sm:w-2/4"
//                           >
//                             <div className="flex-1">
//                               <p className="font-semibold">{agent.name}</p>
//                               <p className="text-sm text-gray-500">
//                                 {agent.phone_number}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 {agent.email}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 {agent.address}
//                               </p>
//                             </div>
//                             <Button
//                               size="sm"
//                               onClick={() =>
//                                 setAssignments({
//                                   ...assignments,
//                                   [request.id]: agent.user_id,
//                                 })
//                               }
//                               variant={
//                                 assignments[request.id] === agent.user_id
//                                   ? "default"
//                                   : "outline"
//                               }
//                             >
//                               {assignments[request.id] === agent.user_id
//                                 ? "Selected"
//                                 : "Select"}
//                             </Button>
//                           </div>
//                         ))
//                       ) : (
//                         <p>No available agents</p>
//                       )}
//                     </div>

//                     {/* Assign Button */}
//                     <div className="p-4 flex justify-end">
//                       <Button
//                         onClick={() => assignAgent(request.id)}
//                         disabled={loading}
//                       >
//                         Assign Agent
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }
