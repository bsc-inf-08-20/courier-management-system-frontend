"use client";

import { useState} from "react";
import { usePathname } from "next/navigation"; // Import usePathname
import { useRouter } from "next/navigation"; 
import {
  Truck,
  Users,
  Package,
  Menu,
  User,
  LogOut,
  Box,
  ChevronLeft,
  ChevronRight,
  Bell,
  NewspaperIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { report } from "process";
import { profile } from "console";
import Dashboard from "./desiplaygraphs/page";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state
  const pathname = usePathname(); // Get the current route
  const router = useRouter(); // intialize the router
  // Define navigation items
  const navItems = [
    { href: "/agent", icon: Box, title: "Agent Dashboard" },
    
    {
      href: "/agent/confirm_pickups",
      icon: Truck,
      title: "Comfirm pickup",
    },
    { href: "/agent/monthly_report", 
      icon: NewspaperIcon, 
      title: "monthly report", 
    },
    { href: "/agent/desiplaygraphs", 
      icon: NewspaperIcon, 
      title: "Graphs" },

    { href: "/agent/confirm_customer", 
      icon: Users, 
      title: "Enter Customer's Details" },

    { href: "/agent/notification", 
      icon: Bell,
      title: "Notifications",
     },

     { href: "/agent/profile", 
      icon: UserIcon, 
      title: "profile" },

     { href: "/agent/settings", 
      icon: SettingsIcon, 
      title: "settings" },
      
    // { href: "/agent/agents", icon: Users, title: "Agents" },
    // { href: "/agent/agents", icon: Users, title: "Agents" },
  ];

  // Find the current page title based on the pathname
  const currentPage = navItems.find((item) => item.href === pathname);
  const pageTitle = currentPage ? currentPage.title : "Agent Dashboard"; // Fallback title

  return (
    <div className="w-full flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md border-r flex flex-col 
        transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <h2
            className={`text-xl font-bold transition-opacity ${
              sidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            Agent Panel
          </h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition-all absolute right-4"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-6 w-6" />
            ) : (
              <ChevronRight className="h-6 w-6" />
            )}
          </button>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <item.icon className="h-5 w-5" />
              <span className={`${sidebarOpen ? "block" : "hidden"}`}>
                {item.title}
              </span>
            </Link>
          ))}
        </nav>

        {/* Profile Dropdown at Bottom */}
        <div className="absolute bottom-0 border-t justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col text-left ${
                    sidebarOpen ? "block" : "hidden"
                  }`}
                >
                  <span className="text-sm font-medium">Wedson Chilenga</span>
                  <span className="text-xs text-gray-500">
                    wedsonchilenga@example.com
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="right"
              className="w-48 bg-white shadow-lg rounded-md"
            >
              <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push("/agent/profile")}
              >
                <User className="h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              onClick={() => router.push("/agent_auth/login")}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Header with toggle button for mobile */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold">{pageTitle}</h2>
        </header>

        {/* Static header for desktop */}
        <header className="h-16 border-b flex items-center px-4 hidden md:flex">
          <h2 className="text-lg font-semibold">{pageTitle}</h2>
        </header>

        {/* Main content */}
        <main className="p-4 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
