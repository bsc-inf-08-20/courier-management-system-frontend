"use client";

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";
import { CreateAgentModal } from "@/components/admin/CreateAgentModal";

interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  created_at: string;
  role: string;
}

export default function AgentPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    fetch("http://localhost:3001/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const filteredUsers = data.filter((user) => user.role === "AGENT");
          setUsers(filteredUsers);
        } else {
          console.error("Expected an array of users, but got:", data);
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load users", err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  const handleAgentCreated = (newAgent: User) => {
    setUsers([...users, newAgent]);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    setLoading(true);
    const res = await fetch(`http://localhost:3001/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.ok) {
      toast.success("Agent deleted successfully.");
      setUsers(users.filter((user) => user.user_id !== id));
    } else {
      toast.error("Failed to delete agent.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full justify-center">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Registered Agents</h2>
        <CreateAgentModal onAgentCreated={handleAgentCreated} />
      </div>

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
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(user)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user.user_id)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          setUser={setSelectedUser}
          setUsers={setUsers}
          users={users}
        />
      )}
    </div>
  );
}

interface EditUserModalProps {
  user: User;
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  users: User[];
}

function EditUserModal({ user, setUser, setUsers, users }: EditUserModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    phone_number: string;
    address: string;
  }>({
    name: user.name,
    phone_number: user.phone_number,
    address: user.address,
  });
  const [saving, setSaving] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`http://localhost:3001/users/${user.user_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success("User updated successfully.");
      setUsers(
        users.map((u) =>
          u.user_id === user.user_id ? { ...u, ...formData } : u
        )
      );
      setUser(null);
    } else {
      toast.error("Failed to update user.");
    }
    setSaving(false);
  };

  return (
    <Dialog open={!!user} onOpenChange={() => setUser(null)}>
      <DialogContent className="backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <Input
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Phone Number"
          />
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setUser(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
