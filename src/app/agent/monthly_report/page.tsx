"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";

interface Pickup {
  id: string;
  goodId: string;
  customerName: string;
  weight: number;
  date: string;
  time: string;
  status: "Complete" | "Pending";
}

export default function MonthlyReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pickups, setPickups] = useState<Pickup[]>([]);

  // useEffect(() => {
  //   // Mock data for testing
  //   const mockData = [
  //     {
  //       id: "1",
  //       goodId: "G123",
  //       customerName: "John Doe",
  //       weight: 12.5,
  //       date: "2025-04-01",
  //       time: "10:00 AM",
  //       status: "Pending"
  //     },
  //     {
  //       id: "2",
  //       goodId: "G124",
  //       customerName: "Jane Smith",
  //       weight: 8.2,
  //       date: "2025-04-02",
  //       time: "11:00 AM",
  //       status: "Complete"
  //     }
  //   ];
  
  //   setPickups(mockData); // Use mock data for testing
  // }, []);
  

  useEffect(() => {
    async function fetchPickups() {
      const response = await fetch("http://localhost:3001/agent-confirm-pickup");
      const data = await response.json();
      
      console.log(data);  // Log to check the data format
      
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setPickups(data);
      } else {
        console.error("Fetched data is not an array:", data);
      }
    }
  
    fetchPickups();
  }, []);

  // useEffect(() => {
  //   // Fetch the data dynamically (replace with actual API call)
  //   async function fetchPickups() {
  //     const response = await fetch("http://localhost:3001/agent-confirm-pickup"); // Adjust API endpoint
  //     const data = await response.json();
  //     setPickups(data);
  //   }
  //   fetchPickups();
  // }, []);

  const filteredData = pickups.filter((item) => item.id.includes(searchQuery));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-center text-3xl font-bold mb-4">The Monthly Pickup Delivery Reports</h1>
      
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
            <TableCell>Numbers</TableCell>
            <TableCell>Goods ID</TableCell>
            <TableCell>Customer Name</TableCell>
            <TableCell>weight</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.customerName}</TableCell>
                <TableCell>{item.weight}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.time}</TableCell>
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
