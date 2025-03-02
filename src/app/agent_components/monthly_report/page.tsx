"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";

interface Pickup {
  id: string;
  date: string;
  time: string;
  customerName: string;
  status: "Complete" | "Pending";
}

export default function MonthlyReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pickups, setPickups] = useState<Pickup[]>([]);

  useEffect(() => {
    // Fetch the data dynamically (replace with actual API call)
    async function fetchPickups() {
      const response = await fetch("/api/pickups"); // Adjust API endpoint
      const data = await response.json();
      setPickups(data);
    }
    fetchPickups();
  }, []);

  const filteredData = pickups.filter((item) => item.id.includes(searchQuery));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">The Monthly Pickup Delivery Reports</h1>
      
      <Input
        type="text"
        placeholder="Search by Goods ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full p-2 border rounded-md"
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>#</TableCell>
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
  );
}
