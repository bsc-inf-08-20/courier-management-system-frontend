
'use client'; 

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';


// Fetch data on the server-side (could be from an API route or direct server-side fetch)
async function fetchData(endpoint: string) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to fetch data");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}
interface Pickup {
  id: string;
  date: string;
  time: string;
  customerName: string;
  status: "Complete" | "Pending";
}

// The main dashboard component
export default function AgentDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pickups, setPickups] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Fetching the data after the component mounts (client-side)
    const loadPickups = async () => setPickups(await fetchData('/api/pickups'));
    const loadMessages = async () => setMessages(await fetchData('/api/messages'));

    loadPickups();
    loadMessages();
  }, []);


  const filteredData = pickups.filter((item) => item.id.includes(searchQuery));
  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="p-4 border rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Today's Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-grey">
            <CardContent className="p-4 text-lg font-medium">
              Number of Parcel Picked: {pickups.length}
            </CardContent>
          </Card>
          <Card className="bg-white-100">
            <CardContent className="p-4 text-lg font-medium">
              Customers Served: {pickups.filter((p) => p.status === 'Completed').length}
            </CardContent>
          </Card>
          <Card className="bg-whte-100">
            <CardContent className="p-4 text-lg font-medium">
              Messages: {messages.length}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pickups Table */}
      <div className="p-4 border rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Recent Pickups (Last 24 Hours)</h2>
        <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Numbers</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Goods ID</TableCell>
            <TableCell>Customer Name</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.time}</TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.customerName}</TableCell>
                <TableCell className={item.status === "Complete" ? "text-green-600" : "text-yellow-600"}>
                  {item.status}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <td colSpan={6} className="text-center">
                No matching records found
              </td>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
      </div>
  );
}
