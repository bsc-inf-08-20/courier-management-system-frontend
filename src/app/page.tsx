import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Package, Truck, MapPin } from "lucide-react"; // Icons from lucide-react

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Malawi Courier</h1>
          <nav className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Fast. Reliable. Local Courier Services
          </h2>
          <p className="text-lg md:text-xl mb-6">
            Send packages anywhere in Malawi with ease. Book, track, and deliver—all in one place.
          </p>
          <div className="space-x-4">
            <Link href="/booking">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Book Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tracking">
              <Button size="lg" variant="outline" className="text-white border-white">
                Track Package
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Why Choose Us?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Easy Booking */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-blue-500" />
                <span>Easy Booking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Book your courier in minutes with our simple online form.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2: Reliable Agents */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-6 w-6 text-blue-500" />
                <span>Reliable Agents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Trusted local agents ensure your package is picked up and delivered on time.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3: Real-Time Tracking */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-blue-500" />
                <span>Real-Time Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Follow your package every step of the way with live updates.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2025 Malawi Courier. All rights reserved.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}