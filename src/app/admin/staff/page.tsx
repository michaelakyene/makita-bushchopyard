"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { doc as firestoreDoc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, RefreshCw, Shield, UserPlus, X } from "lucide-react";

interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: any;
}

export default function AdminStaffPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    role: "staff",
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (authLoading) {
        setLoading(true);
        return;
      }

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(firestoreDoc(db, "users", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data()?.role;
          setIsAdmin(role === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [user, authLoading]);

  const loadUsers = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    } catch (error: any) {
      console.error("Error loading users:", error);
      // ✅ Show user-friendly error
      if (error.code === "permission-denied") {
        toast.error(
          "You don't have permission to view users. Please contact your administrator.",
        );
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const handleAddStaff = async () => {
    if (!formData.email || !formData.displayName) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Check if user already exists in Firestore
      const existingUsers = await getDocs(collection(db, "users"));
      const exists = existingUsers.docs.some(
        (doc) => doc.data().email === formData.email,
      );

      if (exists) {
        // ✅ Update existing user's role
        const userDoc = existingUsers.docs.find(
          (doc) => doc.data().email === formData.email,
        );
        if (userDoc) {
          await updateDoc(doc(db, "users", userDoc.id), {
            role: formData.role,
            updatedAt: new Date(),
          });
          toast.success(`Updated ${formData.email} to ${formData.role}`);
        }
      } else {
        // ✅ Create new user document in Firestore
        // Note: This only creates the Firestore doc.
        // The user must also exist in Firebase Auth.
        await addDoc(collection(db, "users"), {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          uid: `temp_${Date.now()}`, // This will be updated when they login
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success(`Added ${formData.email} as ${formData.role}`);
      }

      setIsDialogOpen(false);
      setFormData({ email: "", displayName: "", role: "staff" });
      loadUsers();
    } catch (error: any) {
      console.error("Error adding staff:", error);
      if (error.code === "permission-denied") {
        toast.error(
          "You don't have permission to add staff. Please check your admin status.",
        );
      } else {
        toast.error("Failed to add staff: " + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const promoteUser = async (userId: string, currentRole: string) => {
    const newRole =
      currentRole === "admin" ? "staff"
      : currentRole === "staff" ? "customer"
      : "staff";

    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: new Date(),
      });
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      if (error.code === "permission-denied") {
        toast.error("You don't have permission to update roles.");
      } else {
        toast.error("Failed to update role");
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary">Admin</Badge>;
      case "staff":
        return <Badge className="bg-blue-600">Staff</Badge>;
      default:
        return <Badge variant="outline">Customer</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(date);
    } catch {
      return "Invalid date";
    }
  };

  // ✅ Show loading
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // ✅ If not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-blue-100 p-4 rounded-full">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Please Sign In</h2>
        <p className="text-muted-foreground">
          You need to be logged in to access this page.
        </p>
        <Button onClick={() => router.push("/admin/login")}>Admin Login</Button>
      </div>
    );
  }

  // ✅ If not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-red-100 p-4 rounded-full">
          <Shield className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have admin permissions.
        </p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff and admin accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadUsers}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name *</Label>
                  <Input
                    id="displayName"
                    placeholder="John Doe"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="text-xs text-muted-foreground">
                  ⚠️ User must already exist in Firebase Auth. This will create
                  their Firestore document.
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddStaff} disabled={submitting}>
                  {submitting ? "Adding..." : "Add Staff"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">All Users</h2>
              <Badge variant="secondary">{users.length}</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            {users.length === 0 ?
              <div className="p-8 text-center text-muted-foreground">
                No users found. Add your first staff member!
              </div>
            : <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {user.displayName || "User"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3 text-right">
                        {user.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => promoteUser(user.id, user.role)}
                            className="text-primary hover:text-primary"
                          >
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">
                              {user.role === "staff" ?
                                "Promote to Admin"
                              : "Promote to Staff"}
                            </span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
