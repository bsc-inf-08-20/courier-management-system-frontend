"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  created_at: string;
  role: string;
}

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:3001/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        if (Array.isArray(data)) {
          const filteredUsers = data.filter((user) => user.role === "USER");
          setUsers(filteredUsers);
        } else {
          console.error("Expected an array of users, but got:", data);
          setUsers([]);
        }
      } catch (err) {
        console.error("Failed to load users", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("User deleted successfully.");
        setUsers(users.filter((user) => user.user_id !== id));
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4">List of Users</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {user.name}'s account?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user.user_id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import { Trash2, Edit } from "lucide-react";

// interface User {
//   user_id: number;
//   name: string;
//   email: string;
//   phone_number: string;
//   address: string;
//   created_at: string;
//   role: string; // Added role property
// }

// export default function CustomersPage() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     fetch("http://localhost:3001/users", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch users");
//         return res.json();
//       })
//       .then((data) => {
//         if (Array.isArray(data)) {
//           // ✅ Filter users to include only those with role "USER"
//           const filteredUsers = data.filter((user) => user.role === "USER");
//           setUsers(filteredUsers);
//         } else {
//           console.error("Expected an array of users, but got:", data);
//           setUsers([]);
//         }
//       })
//       .catch((err) => {
//         console.error("Failed to load users", err);
//         setUsers([]);
//       });
//   }, []);

//   const openEditModal = (user: User) => {
//     setSelectedUser(user);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this user?")) return;

//     setLoading(true);
//     const res = await fetch(`http://localhost:3001/admin/users/${id}`, {
//       method: "DELETE",
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     });

//     if (res.ok) {
//       toast.success("User deleted successfully.");
//       setUsers(users.filter((user) => user.user_id !== id));
//     } else {
//       toast.error("Failed to delete user.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="w-full justify-center">
//       <h2 className="text-2xl font-bold mb-4">List of Users</h2>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Name</TableHead>
//             <TableHead>Email</TableHead>
//             <TableHead>Phone</TableHead>
//             <TableHead>Address</TableHead>
//             <TableHead>Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {users.map((user) => (
//             <TableRow key={user.user_id}>
//               <TableCell>{user.name}</TableCell>
//               <TableCell>{user.email}</TableCell>
//               <TableCell>{user.phone_number}</TableCell>
//               <TableCell>{user.address}</TableCell>
//               <TableCell className="flex gap-2">
//                 <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
//                   <Edit className="w-4 h-4" />
//                 </Button>
//                 <Button variant="destructive" size="sm" onClick={() => handleDelete(user.user_id)} disabled={loading}>
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//       {selectedUser && (
//         <EditUserModal user={selectedUser} setUser={setSelectedUser} setUsers={setUsers} users={users} />
//       )}
//     </div>
//   );
// }

// interface EditUserModalProps {
//   user: User;
//   setUser: (user: User | null) => void;
//   setUsers: (users: User[]) => void;
//   users: User[];
// }

// function EditUserModal({ user, setUser, setUsers, users }: EditUserModalProps) {
//   const [formData, setFormData] = useState<{ name: string; phone_number: string; address: string }>({
//     name: user.name,
//     phone_number: user.phone_number,
//     address: user.address,
//   });
//   const [saving, setSaving] = useState<boolean>(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     const res = await fetch(`http://localhost:3001/users/${user.user_id}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//       body: JSON.stringify(formData),
//     });

//     if (res.ok) {
//       toast.success("User updated successfully.");
//       setUsers(users.map((u) => (u.user_id === user.user_id ? { ...u, ...formData } : u)));
//       setUser(null);
//     } else {
//       toast.error("Failed to update user.");
//     }
//     setSaving(false);
//   };

//   return (
//     <Dialog open={!!user} onOpenChange={() => setUser(null)}>
//       <DialogContent className="backdrop-blur-sm">
//         <DialogHeader>
//           <DialogTitle>Edit User</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-3">
//           <Input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
//           <Input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" />
//           <Input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
//         </div>
//         <DialogFooter>
//           <Button variant="secondary" onClick={() => setUser(null)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave} disabled={saving}>
//             {saving ? "Saving..." : "Save Changes"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
