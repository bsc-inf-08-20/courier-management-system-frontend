// components/Navbar.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          CMIS
        </Link>

        {/* Navigation Links */}
        <div className="space-x-4">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/customer/booking">
            <Button variant="ghost">Book a Courier</Button>
          </Link>
          <Link href="/customer/tracking">
            <Button variant="ghost">Track Package</Button>
          </Link>
          <Link href="/customer/auth">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}