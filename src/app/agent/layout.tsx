"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Truck,
  Users,
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
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { logout, decodedToken } = useAuth("AGENT");
  const pathname = usePathname();
  const router = useRouter();

  // Load user data from decoded token
  const userData = {
    name: decodedToken?.name || "Agent",
    email: decodedToken?.email || "agent@example.com",
    initials: decodedToken?.name
      ? decodedToken.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
      : "AG",
  };

  // Detect screen size and set initial sidebar state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // Open by default on desktop, closed on mobile
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define navigation items
  const navItems = [
    { href: "/agent", icon: Box, title: "Agent Dashboard" },

    {
      href: "/agent/confirm-pickups",
      icon: Truck,
      title: "Comfirm pickup",
    },
    { href: "/agent/deliver-packet", icon: Truck, title: "Deliver Packet" },

    {
      href: "/agent/map",
      icon: Box,
      title: "Map",
    },
    {
      href: "/agent/monthly-report",
      icon: NewspaperIcon,
      title: "monthly report",
    },
    { href: "/agent/desiplaygraphs", icon: NewspaperIcon, title: "Graphs" },

    {
      href: "/agent/confirm-customer",
      icon: Users,
      title: "Enter Customer's Details",
    },

    { href: "/agent/notification", icon: Bell, title: "Notifications" },

    { href: "/agent/profile", icon: UserIcon, title: "profile" },

    { href: "/agent/settings", icon: SettingsIcon, title: "settings" },

    //{ href: "/agent/Agent", icon:User, title: "Agent" },
    // { href: "/agent/agents", icon: Users, title: "Agents" },
  ];

  // Find the current page title based on the pathname
  const currentPage = navItems.find((item) => item.href === pathname);
  const pageTitle = currentPage ? currentPage.title : "Agent Dashboard"; // Fallback title

  const handleLogout = () => {
    logout();
  };

  return (
    <AuthGuard requiredRole="AGENT">
      <div className="w-full flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full bg-white shadow-md border-r flex flex-col 
        transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen
            ? "w-64 opecity-100"
            : isMobile
            ? "w-0 opacity-0 overflow-hidden"
            : "w-16 opacity-100"
        }`}
        >
          <div className="p-4 flex items-center justify-between h-16">
            {sidebarOpen && (
              <h2 className="text-xl font-bold whitespace-nowrap">
                Agent Panel
              </h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-all absolute right-4"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-6 w-5" />
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
                <span
                  className={`whitespace ${sidebarOpen ? "block" : "hidden"}`}
                >
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
                    <AvatarImage src=" " alt="User" />
                    <AvatarFallback>Agent</AvatarFallback>
                  </Avatar>

                  {sidebarOpen && (
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-sm font-medium truncate">
                        {userData?.name || "Agent"}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {userData?.email || "agent@example.com"}
                      </span>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="right"
                className="w-56 bg-white shadow-lg rounded-md"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push("/agent/profile")}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
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
            sidebarOpen && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-16"
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
            <div className="w-6"></div> {/* Spacer for alignment */}
          </header>

          {/* Static header for desktop */}
          <header className="h-16 border-b flex items-center px-4 hidden md:flex">
            <h2 className="text-lg font-semibold">{pageTitle}</h2>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
