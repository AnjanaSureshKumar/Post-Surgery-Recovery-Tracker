import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Pin, 
  AlertTriangle, 
  StickyNote 
} from "lucide-react";
import { BottomNavigation } from "./BottomNavigation";
import { apiGetNotesByPatientId } from "../api/client";

interface Note {
  _id: string;
  content: string;
  createdAt: string;
  pinned: boolean;
  priority: "normal" | "high";
}

interface AllDoctorNotesScreenProps {
  user: any;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

export function AllDoctorNotesScreen({
  user,
  onNavigate,
  onLogout,
}: AllDoctorNotesScreenProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const fixedUser = {
    ...storedUser,
    _id: storedUser._id || storedUser.id,
  };
  const patientId =
    fixedUser?.patientId ||
    fixedUser?._id ||
    user?.patientId ||
    user?._id;

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGetNotesByPatientId(patientId);
        setNotes(res.data || []);
      } catch {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  const filteredNotes = notes
    .filter((n) => {
      if (filter === "high") return n.priority === "high";
      if (filter === "pinned") return n.pinned;
      return true;
    })
    .filter((n) => n.content.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-green-50/50 pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onNavigate('patient-dashboard')}
                            className="rounded-xl"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </Button>
            <div>
              <h1 className="text-xl font-semibold">All Doctor Notes</h1>
              <p className="text-sm text-gray-500">
                {filteredNotes.length} total notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="rounded-xl"
            >
              All
            </Button>
            <Button
              variant={filter === "pinned" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pinned")}
              className="rounded-xl"
            >
              📌 Pinned
            </Button>
            <Button
              variant={filter === "high" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("high")}
              className="rounded-xl"
            >
              ⚠️ High
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search doctor notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading notes...</p>
        ) : filteredNotes.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="p-12 text-center text-gray-500">
              <StickyNote className="w-10 h-10 mx-auto mb-4 text-gray-400" />
              No doctor notes found
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card
              key={note._id}
              className={`rounded-3xl border-0 shadow-md hover:shadow-lg transition-all p-4 ${
                note.priority === "high"
                  ? "bg-red-50 border-l-4 border-red-500"
                  : "bg-blue-50 border-l-4 border-blue-400"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-3">
                  <p
                    className={`text-sm leading-relaxed ${
                      note.priority === "high"
                        ? "text-red-700 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                  {note.pinned && (
                    <p className="text-yellow-600 text-xs font-medium mt-1 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </p>
                  )}
                </div>
                <Badge
                  className={`text-xs px-2 py-1 rounded-full ${
                    note.priority === "high"
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {note.priority === "high" ? (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" /> High
                    </>
                  ) : (
                    "Normal"
                  )}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="notes"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    </div>
  );
}
