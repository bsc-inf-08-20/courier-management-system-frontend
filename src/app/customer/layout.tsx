// /app/customer/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import {
  Package,
  History,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  {
    href: "/customer",
    icon: LayoutDashboard,
    title: "Dashboard",
  },
  {
    href: "/customer/book-pickup",
    icon: BookOpen,
    title: "Book Pickup",
  },
  {
    href: "/customer/my-packets",
    icon: Package,
    title: "My Packets",
  },
  {
    href: "/customer/history",
    icon: History,
    title: "History",
  },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    initials: string;
  } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth("USER");

  // Load user data from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserData({
          name: payload.name || "Customer",
          email: payload.email || "",
          initials: payload.name
            ? payload.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
            : "CU",
        });
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <AuthGuard requiredRole="USER">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <nav className="flex space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === item.href
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={userData?.name} />
                      <AvatarFallback>{userData?.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">
                      {userData?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-4 py-2"
                    onClick={() => router.push("/customer/profile")}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-4 py-2 text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}