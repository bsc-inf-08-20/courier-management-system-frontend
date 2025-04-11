"use client";
import Navbar from "@/components/customer/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Package, Truck, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen min-w-full bg-gray-100 flex flex-col">
      <Navbar />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-grow flex items-center justify-center py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
      >
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight"
          >
            Your Trusted Courier in Malawi
          </motion.h2>
          
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Send packages with ease—book, track, and deliver seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/customer/booking">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-blue-600 hover:bg-white/20 shadow-lg transition-all"
              >
                Book Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/customer/tracking">
              <Button
                size="lg"
                variant="outline"
                className="text-blue-600 border-white hover:bg-white/20 shadow-lg transition-all"
              >
                Track Package
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>
      <section className="py-16 max-w-6xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Why Choose Us?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" /> Easy Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Book in minutes with our streamlined process.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-blue-600" /> Reliable Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our trusted agents ensure timely pick-up and delivery.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" /> Real-Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your package every step of the way.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>© 2025 Malawi Courier. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
