"use client";
import Navbar from "@/components/customer/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Package, Truck, MapPin, Star, Shield, Clock, Users, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Hero Section with Enhanced Design */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative flex-grow flex items-center justify-center py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={floatingAnimation}
            className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
            className="absolute top-40 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 2 } }}
            className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 } }}
            className="absolute bottom-40 right-1/3 w-16 h-16 bg-green-400/20 rounded-full blur-lg"
          />
        </div>

        {/* Glassmorphism Card Container */}
        <div className="relative z-10 max-w-6xl mx-auto text-center px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="backdrop-blur-lg bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl"
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center mb-6"
            >
              <div className="flex items-center space-x-2 bg-yellow-400/20 px-4 py-2 rounded-full">
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
                <span className="text-sm font-medium">Malawi's #1 Courier Service</span>
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
            >
              Lightning Fast
              <br />
              <span className="text-yellow-300">Delivery</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl md:text-2xl mb-10 opacity-90 font-light leading-relaxed max-w-3xl mx-auto"
            >
              Experience the future of package delivery in Malawi. 
              <br className="hidden md:block" />
              <span className="text-yellow-300 font-semibold">Lightning-fast booking</span>, 
              <span className="text-blue-200 font-semibold"> real-time tracking</span>, 
              <span className="text-purple-200 font-semibold"> guaranteed delivery</span>.
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row justify-center gap-6"
            >
              <Link href="/customer/booking">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-yellow-400/30 transform hover:scale-105 transition-all duration-300 border-0"
                >
                  <Zap className="mr-2 h-6 w-6" />
                  Book Instant Delivery
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/customer/tracking">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 font-semibold px-8 py-4 rounded-full shadow-xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Track Your Package
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex justify-center items-center space-x-8 mt-12 text-sm opacity-80"
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-300" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-300" />
                <span>50K+ Happy Customers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-300" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Features Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Our Service?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference with Malawi's most advanced courier platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: "Instant Booking",
                description: "Book your delivery in under 60 seconds with our AI-powered system",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50"
              },
              {
                icon: Truck,
                title: "Verified Agents",
                description: "Our elite courier network ensures your packages are in safe hands",
                color: "from-green-500 to-emerald-600",
                bgColor: "bg-green-50"
              },
              {
                icon: MapPin,
                title: "Live Tracking",
                description: "Watch your package move in real-time with GPS precision",
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50"
              },
              {
                icon: Zap,
                title: "Lightning Speed",
                description: "Same-day delivery across major cities in Malawi",
                color: "from-yellow-500 to-orange-500",
                bgColor: "bg-yellow-50"
              },
              {
                icon: Shield,
                title: "Full Insurance",
                description: "Every package is insured up to MWK 500,000 at no extra cost",
                color: "from-red-500 to-pink-600",
                bgColor: "bg-red-50"
              },
              {
                icon: Globe,
                title: "Nationwide Coverage",
                description: "Delivering to every district in Malawi with expanding rural reach",
                color: "from-indigo-500 to-blue-600",
                bgColor: "bg-indigo-50"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`h-full ${feature.bgColor} border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer overflow-hidden relative`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <span className="group-hover:text-gray-800 transition-colors">{feature.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { number: "50K+", label: "Packages Delivered" },
              { number: "99.9%", label: "Success Rate" },
              { number: "24/7", label: "Customer Support" },
              { number: "28", label: "Districts Covered" }
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg opacity-80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Courier Management Information System
            </h3>
            <p className="opacity-75 mb-6">
              Revolutionizing package delivery across Malawi with cutting-edge technology
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-sm">Secure & Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Always On Time</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm">5-Star Rated</span>
              </div>
            </div>
            <p className="opacity-60">
              © 2025 Courier Management Information System. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}