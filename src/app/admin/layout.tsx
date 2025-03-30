"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  LayoutDashboard, // For Overview
  Upload, // For Sending
  Download, // For Receiving
  UserRound, // For Agents (distinct from Customers)
  MapPin, // For Dispatch
  PackageSearch, // For Tracking
  ClipboardList,
} from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to false
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

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

  // Authentication check
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login/admin");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "ADMIN") {
        router.push("/login/admin");
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      router.push("/login/admin");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading)
    return (
      <p className="flex justify-center items-center h-screen text-center w-full">
        Checking authentication...
      </p>
    );

  if (!isAuthorized) return null;

  const navItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      title: "Overview",
    },
    {
      href: "/admin/book-pickup-requests",
      icon: ClipboardList, // or Truck if you prefer
      title: "Book Pickup Requests",
    },
    {
      href: "/admin/sending",
      icon: Upload,
      title: "Sending",
    },
    {
      href: "/admin/dispatch",
      icon: MapPin,
      title: "Dispatch",
    },
    {
      href: "/admin/tracking",
      icon: PackageSearch,
      title: "Track Package",
    },
    {
      href: "/admin/receiving",
      icon: Download,
      title: "Receiving",
    },
    {
      href: "/admin/packages",
      icon: Package,
      title: "Packages",
    },
    {
      href: "/admin/customers",
      icon: Users,
      title: "Customers",
    },
    {
      href: "/admin/agents",
      icon: UserRound, // Different from Customers
      title: "Agents",
    },
  ];

  const currentPage = navItems.find((item) => item.href === pathname);
  const pageTitle = currentPage ? currentPage.title : "Admin Dashboard";

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md border-r flex flex-col transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen
            ? "w-64 opacity-100 pointer-events-auto"
            : isMobile
            ? "w-0 opacity-0 pointer-events-none overflow-hidden" // Fully hidden on mobile
            : "w-16 opacity-100 pointer-events-auto" // Collapsed on desktop
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold">Admin Panel</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition-all absolute right-2"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-6 w-6" />
            ) : (
              <ChevronRight className="h-6 w-6" />
            )}
          </button>
        </div>
        <nav className="flex flex-col space-y-2 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => isMobile && setSidebarOpen(false)} // Auto-close on mobile
            >
              <item.icon className="h-5 w-5" />
              <span className={`${sidebarOpen ? "block" : "hidden"}`}>
                {item.title}
              </span>
            </Link>
          ))}
        </nav>

        {/* Profile Dropdown */}
        <div className="absolute bottom-0 border-t w-full">
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
                  <span className="text-sm font-medium">Admin</span>
                  <span className="text-xs text-gray-500">
                    admin@example.com
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="right"
              className="w-48 bg-white shadow-lg rounded-md"
            >
              <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                <User className="h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login/admin");
                }}
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
        <header className="h-10 border-b flex items-center justify-between px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold">{pageTitle}</h2>
        </header>

        {/* Static header for desktop */}
        <header className=" h-16 border-b flex items-center px-4 hidden md:flex">
          <h2 className=" text-lg text-center font-semibold">{pageTitle}</h2>
        </header>

        {/* Main content */}
        <main className="p-4 flex-1 w-full flex justify-center ">
          {children}
        </main>
      </div>
    </div>
  );
}
