"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Plus,
  Bell,
  Star,
  DollarSign,
  User,
  Eye,
  Shield,
  Award,
  Phone,
  Mail,
  CreditCard,
  History,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  const {  isLoading } = useAuth("USER");

  // Mock customer data - replace with real data from your API
  const customerData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone:  "+265 999 123 456",
    address:  "Area 47, Sector 3, Lilongwe",
    memberSince: "January 2023",
    loyaltyPoints: 1250,
    preferredDeliveryTime: "Morning (9AM - 12PM)"
  };

  const personalStats = {
    myPackages: 24,
    myActiveDeliveries: 3,
    myCompletedDeliveries: 21,
    myTotalSpent: 125000,
    myAverageRating: 4.8,
    myFavoriteDestinations: ["Lilongwe", "Blantyre", "Mzuzu"]
  };

  const myRecentPackages = [
    {
      id: "MY-PKG001",
      recipient: "Jane Banda (My Sister)",
      destination: "Lilongwe",
      status: "In Transit",
      progress: 65,
      sentDate: "Dec 15, 2024",
      estimatedDelivery: "Today, 3:00 PM",
      trackingCode: "CMI2025001",
      myNote: "Birthday gift - handle with care"
    },
    {
      id: "MY-PKG002", 
      recipient: "My Office",
      destination: "Blantyre",
      status: "Delivered",
      progress: 100,
      sentDate: "Dec 10, 2024",
      deliveredAt: "Yesterday, 2:30 PM",
      trackingCode: "CMI2025002",
      myNote: "Important documents"
    },
    {
      id: "MY-PKG003",
      recipient: "Mom (Mary Phiri)",
      destination: "Mzuzu", 
      status: "Pending Pickup",
      progress: 10,
      sentDate: "Dec 20, 2024",
      scheduledPickup: "Tomorrow, 9:00 AM",
      trackingCode: "CMI2025003",
      myNote: "Christmas present"
    }
  ];

  const myNotifications = [
    {
      id: 1,
      type: "delivery",
      message: "Your package to Jane Banda is out for delivery",
      time: "10 mins ago",
      unread: true,
      personal: true
    },
    {
      id: 2,
      type: "loyalty",
      message: "You've earned 50 loyalty points! Total: 1,250 points",
      time: "2 hours ago", 
      unread: true,
      personal: true
    },
    {
      id: 3,
      type: "success",
      message: "Your package was successfully delivered to your office",
      time: "1 day ago",
      unread: false,
      personal: true
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your personal dashboard...</p>
        </div>
      </div>
    );
  }

  // interface StatusColorMap {
  //   Delivered: string;
  //   'In Transit': string;
  //   'Pending Pickup': string;
  //   [key: string]: string;
  // }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800 border-green-200";
      case "In Transit": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending Pickup": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Personal Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {customerData.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Your personal delivery dashboard • Member since {customerData.memberSince}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Award className="h-3 w-3 mr-1" />
                {personalStats.myAverageRating} ⭐ Customer Rating
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {customerData.loyaltyPoints} Loyalty Points
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              <Bell className="h-4 w-4" />
              My Updates
              <Badge variant="destructive" className="ml-1">3</Badge>
            </Button>
            <Link href="/customer/booking">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Send Package
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Personal Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              title: "My Packages Sent",
              value: personalStats.myPackages,
              icon: Package,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50",
              change: "3 sent this week"
            },
            {
              title: "My Active Deliveries",
              value: personalStats.myActiveDeliveries,
              icon: Clock,
              color: "from-green-500 to-emerald-600",
              bgColor: "bg-green-50",
              change: "2 arriving today"
            },
            {
              title: "My Completed",
              value: personalStats.myCompletedDeliveries,
              icon: CheckCircle,
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50",
              change: "12 this month"
            },
            {
              title: "My Total Spent",
              value: `MWK ${personalStats.myTotalSpent.toLocaleString()}`,
              icon: DollarSign,
              color: "from-orange-500 to-red-500",
              bgColor: "bg-orange-50",
              change: "This year"
            }
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* My Recent Packages */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    My Recent Packages
                  </CardTitle>
                  <Link href="/customer/my-packages">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                      View All My Packages <Eye className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {myRecentPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">To: {pkg.recipient}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pkg.destination}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Sent: {pkg.sentDate}
                        </p>
                      </div>
                      <Badge className={getStatusColor(pkg.status)}>
                        {pkg.status}
                      </Badge>
                    </div>
                    
                    {pkg.myNote && (
                      <div className="mb-3 p-2 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm text-gray-700">
                          <strong>My Note:</strong> {pkg.myNote}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Progress</span>
                        <span className="font-medium">{pkg.progress}%</span>
                      </div>
                      <Progress value={pkg.progress} className="h-2" />
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-500">
                          {pkg.estimatedDelivery || pkg.deliveredAt || pkg.scheduledPickup}
                        </span>
                        <Link href={`/customer/tracking?code=${pkg.trackingCode}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100 h-8 px-3">
                            Track My Package
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal Sidebar */}
          <div className="space-y-6">
            
            {/* My Profile Summary */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    My Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p><strong>Email:</strong> {customerData.email}</p>
                    <p><strong>Phone:</strong> {customerData.phone}</p>
                    <p><strong>Address:</strong> {customerData.address}</p>
                    <p><strong>Preferred Time:</strong> {customerData.preferredDeliveryTime}</p>
                  </div>
                  <Link href="/customer/profile">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 border border-white/20 mt-4">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit My Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Notifications */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    My Recent Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myNotifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg transition-colors ${notification.unread ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                      <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50">
                    View All My Notifications
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Support */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                    <Shield className="h-5 w-5" />
                    Personal Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-green-700">
                    Need help with your deliveries? We&apos;re here for you 24/7
                  </p>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-green-700 hover:bg-green-100">
                      <Phone className="h-4 w-4 mr-2" />
                      Call My Support
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-green-700 hover:bg-green-100">
                      <Mail className="h-4 w-4 mr-2" />
                      Email My Questions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* My Personal Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              title: "My Delivery History",
              description: "View all packages I've sent",
              icon: History,
              href: "/customer/my-history",
              color: "from-blue-500 to-blue-600"
            },
            {
              title: "My Billing",
              description: "My payments and invoices",
              icon: CreditCard,
              href: "/customer/my-billing",
              color: "from-green-500 to-emerald-600"
            },
            {
              title: "My Favorites",
              description: "My frequent destinations",
              icon: Star,
              href: "/customer/my-favorites",
              color: "from-purple-500 to-purple-600"
            },
            {
              title: "My Preferences",
              description: "Customize my experience",
              icon: Settings,
              href: "/customer/my-settings",
              color: "from-orange-500 to-red-500"
            }
          ].map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Link href={feature.href}>
                <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}