"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Packet {
  id: number;
  customerName: string;
  trackingId: string; 
  destination: string;
  status: "Pending Delivery" | "Done";
  collected: boolean;
  date: Date;
}

export default function AgentDeliveryPage() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch packets assigned to this agent
  useEffect(() => {
    const fetchPackets = async () => {
      try {
        const response = await fetch('/api/agent/packets');
        const data = await response.json();
        console.log("Packets for current agent:", data); // new line added
        setPackets(data);
      } catch (error) {
        console.error("Error fetching packets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackets();
  }, []);

  const handleCollect = async (id: number) => {
    try {
      // Update local state optimistically
      setPackets(prev =>
        prev.map(packet =>
          packet.id === id ? { ...packet, collected: true } : packet
        )
      );

      // Update in database
      await fetch(`/api/agent/packets/${id}/collect`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collected: true }),
      });
    } catch (error) {
      console.error("Error updating collection status:", error);
      // Revert state if API call fails
      setPackets(prev =>
        prev.map(packet =>
          packet.id === id ? { ...packet, collected: false } : packet
        )
      );
    }
  };

  const handleConfirmReceived = async (id: number) => {
    try {
      // Update local state optimistically
      setPackets(prev =>
        prev.map(packet =>
          packet.id === id ? { ...packet, status: "Done" } : packet
        )
      );

      // Update in database
      await fetch(`/api/agent/packets/${id}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: "Done" }),
      });
    } catch (error) {
      console.error("Error confirming delivery:", error);
      // Revert state if API call fails
      setPackets(prev =>
        prev.map(packet =>
          packet.id === id ? { ...packet, status: "Pending Delivery" } : packet
        )
      );
    }
  };

  // Filter packets
  const packetsToDeliver = packets.filter(p => !p.collected);
  const collectedPackets = packets.filter(p => p.collected);

  if (loading) {
    return <div className="text-center py-8">Loading packets...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">Deliver Packets</h1>

      <Tabs defaultValue="toDeliver">
        <TabsList className="flex justify-center mb-4 gap-2">
          <TabsTrigger value="toDeliver" className="px-3 py-1 text-sm md:px-4 md:py-2 md:text-base">
            Packets to Deliver
          </TabsTrigger>
          <TabsTrigger value="confirmReceived" className="px-3 py-1 text-sm md:px-4 md:py-2 md:text-base">
            Confirm Received
          </TabsTrigger>
        </TabsList>

        {/* Packets to Deliver */}
        <TabsContent value="toDeliver">
          <div className="border rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                
                  <th className="p-3 text-left text-sm md:text-base">Customer</th>
                  <th className="p-3 text-left text-sm md:text-base">Destination</th>
                  <th className="p-3 text-left text-sm md:text-base">Date</th> 
                  <th className="p-3 text-left text-sm md:text-base">Status</th>
                  <th className="p-3 text-left text-sm md:text-base">Mark Collected</th>
                </tr>
              </thead>
              <tbody>
                {packetsToDeliver.length > 0 ? (
                  packetsToDeliver.map(packet => (
                    <tr key={packet.id} className="border-t">
                      <td className="p-3 text-sm md:text-base">{packet.customerName}</td>
                      <td className="p-3 text-sm md:text-base">{packet.destination}</td>
                      <td className="p-3 text-sm md:text-base">{new Date(packet.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs md:text-sm ${
                          packet.status === "Pending Delivery" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}>
                          {packet.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Checkbox
                          checked={packet.collected}
                          onChange={() => handleCollect(packet.id)}
                          aria-label={`Mark ${packet.customerName}'s packet as collected`}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500 text-sm md:text-base">
                      Currently you dont have any packets assigned to you to deliver to the customer
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Confirm Received */}
        <TabsContent value="confirmReceived">
          <div className="border rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm md:text-base">Customer</th>
                  <th className="p-3 text-left text-sm md:text-base">Destination</th>
                  <th className="p-3 text-left text-sm md:text-base">Date</th> 
                  <th className="p-3 text-left text-sm md:text-base">Tracking ID</th> 
                  <th className="p-3 text-left text-sm md:text-base">Status</th>
                  <th className="p-3 text-left text-sm md:text-base">Confirm Received</th>
                </tr>
                
              </thead>
              <tbody>
                {collectedPackets.length > 0 ? (
                  collectedPackets.map(packet => (
                    <tr key={packet.id} className="border-t">
                      <td className="p-3 text-sm md:text-base">{packet.customerName}</td>
                      <td className="p-3 text-sm md:text-base">{packet.destination}</td>
                      <td className="p-3 text-sm md:text-base text-blue-600">{packet.trackingId}</td> 
                      <td className="p-3 text-sm md:text-base">{new Date(packet.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs md:text-sm ${
                          packet.status === "Pending Delivery" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}>
                          {packet.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {packet.status === "Pending Delivery" ? (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmReceived(packet.id)}
                            className="text-xs md:text-sm"
                          >
                            Confirm
                          </Button>
                        ) : (
                          <span className="text-green-600 font-semibold text-sm md:text-base">Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500 text-sm md:text-base">
                         No packets you have selected yet to deliver to the customers
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}