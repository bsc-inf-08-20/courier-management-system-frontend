"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import {
  Users,
  Menu,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Upload,
  Download,
  UserRound,
  MapPin,
  PackageSearch,
  ClipboardList,
  Rocket,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    initials: string;
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth("ADMIN");

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

  // Load user data from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData({
          name: payload.name || "Admin",
          email: payload.email || "admin@example.com",
          initials: payload.name
            ? payload.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
            : "AM",
        });
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  const navItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      title: "Overview",
    },
    {
      href: "/admin/pickup-requests",
      icon: ClipboardList,
      title: "Pickup Requests",
    },
    {
      href: "/admin/sending",
      icon: Upload,
      title: "Sending",
    },
    {
      href: "/admin/dispatch",
      icon: MapPin,
      title: "Inter-Hub Dispatch",
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
    // Deliver parent with sub-items
    {
      title: "Deliver",
      icon: Rocket,
      children: [
        {
          href: "/admin/home-deliver",
          title: "Home Delivery",
        },
        {
          href: "/admin/hub-pickup",
          title: "Hub Pickup",
        },
      ],
    },
    {
      href: "/admin/customers",
      icon: Users,
      title: "Customers",
    },
    {
      href: "/admin/agents",
      icon: UserRound,
      title: "Agents",
    },
  ];

  const currentPage = navItems.find((item) => item.href === pathname);
  const pageTitle = currentPage ? currentPage.title : "Admin Dashboard";

  const handleLogout = () => {
    logout();
  };

  // Wrap the entire layout with the AuthGuard component
  return (
    <AuthGuard requiredRole="ADMIN">
      <div className="flex h-screen w-full bg-gray-50">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full bg-white shadow-md border-r flex flex-col transition-all duration-300 ease-in-out z-40 ${
            sidebarOpen
              ? "w-64 opacity-100"
              : isMobile
              ? "w-0 opacity-0 overflow-hidden"
              : "w-16 opacity-100"
          }`}
        >
          <div className="p-4 flex items-center justify-between h-16">
            {sidebarOpen && (
              <h2 className="text-xl font-bold whitespace-nowrap">
                Admin Panel
              </h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-all"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2 px-2">
            {navItems.map((item) =>
              !item.children ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 mb-1 ${
                    pathname === item.href ? "bg-blue-50 text-blue-600" : ""
                  }`}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`whitespace-nowrap ${
                      sidebarOpen ? "block" : "hidden"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              ) : (
                <div key={item.title}>
                  <button
                    onClick={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        [item.title]: !prev[item.title],
                      }))
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 mb-1 ${
                      sidebarOpen ? "hover:bg-gray-100" : ""
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left font-semibold">
                          {item.title}
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedSections[item.title] ? "rotate-90" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                  {/* Sub-items */}
                  {sidebarOpen && expandedSections[item.title] && (
                    <div className="mt-1 space-y-1">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-3 pl-12 pr-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 text-sm ${
                            pathname === sub.href
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : ""
                          }`}
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span>{sub.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </nav>

          {/* Profile Section */}
          <div className="border-t p-2 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>
                      {userData?.initials || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-sm font-medium truncate">
                        {userData?.name || "Admin"}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {userData?.email || "admin@example.com"}
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
                  onClick={() => router.push("/admin/profile")}
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

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarOpen && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-16"
          }`}
        >
          {/* Mobile Header */}
          <header className="h-16 border-b flex items-center justify-between px-4 bg-white md:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold">{pageTitle}</h2>
            <div className="w-6"></div> {/* Spacer for alignment */}
          </header>

          {/* Desktop Header */}
          <header className="h-16 border-b hidden md:flex items-center px-6 bg-slate-300">
            <h2 className="text-lg font-semibold ">{pageTitle}</h2>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
