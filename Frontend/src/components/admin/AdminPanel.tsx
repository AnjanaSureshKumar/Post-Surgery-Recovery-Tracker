import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { AddUserDialog } from "./AddUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { UserTable, User as TableUser } from "./UserTable";
import { AddPatientDetailsDialog } from "./AddPatientDetailsDialog";
import { AddPatientDropdownDialog } from "./AddPatientDropdownDialog";

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<TableUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<TableUser | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);

  // 🔹 Fetch all users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log("Fetched users:", data);

        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        } else if (data.success && Array.isArray(data.users)) {
          // Some backends return data.users instead of data.data
          setUsers(data.users);
        } else {
          console.error("Unexpected user data format:", data);
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [refresh]);

  // 🔹 Find selected patient object (for Add/Edit details dialog)
  const selectedPatient = users.find((u) => u._id === selectedPatientId) || null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 🧭 Admin Panel Header */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold">Admin Panel</CardTitle>

            {/* Buttons: Assign Patient + Add New User */}
            <div className="flex gap-2">
              <AddPatientDropdownDialog onAssigned={() => setRefresh(!refresh)} />
              <AddUserDialog onAdded={() => setRefresh(!refresh)} />
            </div>
          </div>
        </CardHeader>

        {/* 📋 User Table */}
        <CardContent>
          <UserTable
            users={users}
            onEdit={(user: TableUser) => setSelectedUser(user)}
            onDeleted={() => setRefresh(!refresh)}
            onAddDetails={(userId: string) => setSelectedPatientId(userId)}
          />
        </CardContent>
      </Card>

      {/* ✏️ Edit User Dialog */}
      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => setRefresh(!refresh)}
        />
      )}

      {/* 🩺 Add/Edit Patient Details Dialog */}
      {selectedPatient && (
        <AddPatientDetailsDialog
          user={selectedPatient}
          open={!!selectedPatientId}
          onOpenChange={(open) => {
            if (!open) setSelectedPatientId(null);
          }}
          onDetailsAdded={() => {
            setRefresh(!refresh);
            setSelectedPatientId(null);
          }}
        />
      )}
    </div>
  );
};

/* 
----------------------------------------------------------
📌 Placeholder API — for future "Assign Patient" feature
----------------------------------------------------------

Example POST request for /api/admin/assign-patient
(to be implemented later in backend)

fetch("http://localhost:5000/api/admin/assign-patient", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    doctorId: "doctor123",
    patientId: "patient456",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log("Assign result:", data))
  .catch((err) => console.error("Error assigning patient:", err));
*/
