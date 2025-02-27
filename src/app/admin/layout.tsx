"use client";

import { useState } from "react";
import { Truck, Users, Package, Menu, User, LogOut, Box } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state

  // Define navigation items
  const navItems = [
    { href: "/admin", icon: Box, title: "Overview" },
    {
      href: "/admin/book-pickup-requests",
      icon: Truck,
      title: "Book Pickup Requests",
    },
    { href: "/admin/customers", icon: Users, title: "Customers" },
    { href: "/admin/packages", icon: Package, title: "Packages" },
    { href: "/admin/agents", icon: Users, title: "Agents" },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md border-r flex flex-col justify-between 
        transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } 
        md:translate-x-0 md:relative z-30`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)} // ✅ Close sidebar on mobile
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile Dropdown at Bottom */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">Austin Munthali</span>
                <span className="text-xs text-gray-500">
                  austin@example.com
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white shadow-lg rounded-md"
            >
              <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                <User className="h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with toggle button for mobile */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </header>

        {/* Static header for desktop */}
        <header className="h-16 border-b flex items-center px-4 hidden md:flex">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </header>

        {/* Main content */}
        <main className="p-4 overflow-auto">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
