// // /src/pages/customer/profile.tsx
// "use client";
// import { useAuth } from "@/hooks/useAuth";
// import { useRouter } from "next/navigation";
// import Navbar from "@/components/customer/Navbar";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useEffect, useState } from "react";

// export default function Profile() {
//   const {  isAuthenticated } = useAuth();
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     name: user?.name || "",
//     email: user?.email || "",
//     phone: "",
//     address: "",
//   });

//   useEffect(() => {
//     if (!isAuthenticated) router.push("/customer/auth");
//   }, [isAuthenticated, router]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Profile Updated:", formData);
//     // Add API call to update profile here
//   };

//   if (!isAuthenticated) return null;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <main className="max-w-2xl mx-auto px-4 py-8">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6">Profile</h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Name</label>
//             <Input
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="mt-1"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <Input
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="mt-1"
//               disabled
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//             <Input
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               className="mt-1"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Address</label>
//             <Input
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               className="mt-1"
//             />
//           </div>
//           <div className="text-right">
//             <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
//               Save Changes
//             </Button>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// }


export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile</h2>
        <p className="text-gray-600">This page is under construction.</p>
        <p className="text-gray-500 mt-2">Please check back later.</p>
      </div>
    </div>
  );
}