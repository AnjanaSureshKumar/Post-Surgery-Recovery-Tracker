import React, { useState,useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiListRecoveries,apiGetRecordsByPatientId,apiGetNotesByPatientId,apiAddNote,apiToggleNotePin} from "../api/client";
import { API_BASE } from "../api/client";
import { 
  ArrowLeft, 
  Calendar, 
  Activity, 
  Thermometer, 
  TrendingUp,
  FileText,
  MessageSquare,
  Plus,
  Pin,
  Clock,
  AlertTriangle,
  CheckCircle,
  LogOut
} from 'lucide-react';

interface PatientDetailViewProps {
  patient: any;
  onBack: () => void;
  onLogout: () => void;
}
interface Note {
  _id: string;
  content: string;
  pinned?: boolean;
  priority?: string;
  createdAt?: string;
}


export function PatientDetailView({ patient, onBack, onLogout }: PatientDetailViewProps) {
  const [newNote, setNewNote] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [reports, setReports] = useState<any[]>([]);
const [isLoadingReports, setIsLoadingReports] = useState(true);
const [notes, setNotes] = useState<Note[]>([]);
const [isLoadingNotes, setIsLoadingNotes] = useState(true);
const [recentActivity, setRecentActivity] = useState<any[]>([]);


useEffect(() => {
  console.log("🧭 Tab check:", selectedTab, "Patient ID:", patient?._id);

  // Only fetch when both patient ID and the tab are valid
  if (!patient?._id || selectedTab !== "reports") return;

  const fetchReports = async () => {
    try {
      console.log("🚀 Fetching reports for patient:", patient._id);
      setIsLoadingReports(true);

      const recRes = await apiGetRecordsByPatientId(patient._id);
      console.log("📦 Record response:", recRes);

      if (recRes?.success && Array.isArray(recRes.data)) {
        setReports(
          recRes.data.map((r: any) => ({
            _id: r._id || crypto.randomUUID(),
            name: r.file?.originalName || "Unnamed Report",
            date: new Date(r.createdAt || r.file?.uploadDate || Date.now()).toLocaleDateString(),
            size: r.file?.size ? `${(r.file.size / 1024).toFixed(1)} KB` : "—",
            filePath: r.file?.filePath?.replace(/\\/g, "/") || "",
          }))
        );
      } else {
        console.warn("⚠️ No reports found for this patient");
        setReports([]);
      }
    } catch (err) {
      console.error("❌ Error loading reports:", err);
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  fetchReports();
}, [selectedTab, patient?._id]); // ✅ re-run when tab or patient ID changes


console.log("🧠 patient.recoveryHistory in DetailView:", patient.recoveryHistory);

  const progressData = patient.recoveryHistory?.map((r: any) => ({
  date: new Date(r.date).toLocaleDateString(),
  pain: r.pain,
  temp: r.temp,
  mobility: r.mobility,
})) || [];
 
  useEffect(() => {
  if (!patient?._id || selectedTab !== "notes") return;

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const res = await apiGetNotesByPatientId(patient._id);

      if (res?.success && Array.isArray(res.data)) {
        setNotes(res.data);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error("❌ Error loading notes:", err);
      setNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  fetchNotes();
}, [selectedTab, patient?._id]);

const addNote = async (pinned = false, priority = "normal") => {
  if (!newNote.trim()) return;

  try {
    const res = await apiAddNote({
      patientId: patient._id,
      content: newNote,
      pinned,
      priority,
    });

    if (res.success) {
      setNotes((prev) => [res.data, ...prev]); // instantly show new note
      setNewNote("");
    } else {
      alert(res.message || "Failed to add note");
    }
  } catch (err) {
    console.error("❌ Error adding note:", err);
  }
};
// Helper to show "time ago" text
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

useEffect(() => {
  if (!patient?._id || selectedTab !== "overview") return;

  const fetchActivity = async () => {
    try {
      const [notesRes, reportsRes, recoveryRes] = await Promise.all([
        apiGetNotesByPatientId(patient._id),
        apiGetRecordsByPatientId(patient._id),
        apiListRecoveries()
      ]);

      // ✅ Filter recoveries belonging to this patient
      const patientRecoveries =
        recoveryRes?.data?.filter(
          (r: any) =>
            String(r.patientId?._id || r.patientId || r.userId?._id || r.userId) ===
            String(patient._id)
        ) || [];

      // ✅ Sort each list by date descending
      const sortedNotes = (notesRes?.data || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const sortedReports = (reportsRes?.data || []).sort(
        (a: any, b: any) =>
          new Date(b.createdAt || b.file?.uploadDate || 0).getTime() -
          new Date(a.createdAt || a.file?.uploadDate || 0).getTime()
      );
      const sortedRecoveries = patientRecoveries.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const latestNote = sortedNotes[0];
      const latestReport = sortedReports[0];
      const latestRecovery = sortedRecoveries[0];

      const activities: any[] = [];

      if (latestNote) {
        const doctorName =
          latestNote.doctorId?.name || latestNote.doctorName || "Doctor";
        activities.push({
          type: "note",
          message: `Note added by ${doctorName}`,
          time: new Date(latestNote.createdAt),
        });
      }

      if (latestReport) {
        activities.push({
          type: "report",
          message: latestReport.file?.originalName
            ? `${latestReport.file.originalName} uploaded by patient`
            : "Report uploaded by patient",
          time: new Date(latestReport.createdAt || latestReport.file?.uploadDate || Date.now()),
        });
      }

      if (latestRecovery) {
        const { temp, pain, mobility } = latestRecovery;
        activities.push({
          type: "log",
          message: `Log: Temp ${temp}°F, Pain ${pain}/10, Mobility ${mobility}%`,
          time: new Date(latestRecovery.date),
        });
      }

      // ✅ Sort newest first
      activities.sort((a, b) => b.time.getTime() - a.time.getTime());

      // ✅ Keep only 1 of each type
      const seen = new Set();
      const uniqueActivities = [];
      for (const act of activities) {
        if (!seen.has(act.type)) {
          seen.add(act.type);
          uniqueActivities.push(act);
        }
      }

      setRecentActivity(uniqueActivities);
    } catch (err) {
      console.error("❌ Failed to fetch recent activity:", err);
      setRecentActivity([]);
    }
  };

  fetchActivity();
}, [selectedTab, patient?._id]);




console.log("🩺 patient.surgeryDate =", patient.surgeryDate);

  let surgeryDateDisplay = "—";
let daysSinceSurgeryDisplay = "—";

if (patient.surgeryDate) {
  const parsed = new Date(patient.surgeryDate);
  if (!isNaN(parsed.getTime())) {
    surgeryDateDisplay = parsed.toLocaleDateString();
    const days = Math.floor(
      (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)
    );
    daysSinceSurgeryDisplay = `${days} days`;
  }
}
const handleDownload = async (recordId: string) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/records/download/${recordId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to download");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patient_report.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-green-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-12 h-12">
                <AvatarImage src={patient.profileImage} alt={patient.name} />
                <AvatarFallback>{patient.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl">{patient.name}</h1>
                <p className="text-sm text-gray-600">{patient.age} years old • Day {daysSinceSurgeryDisplay} post-surgery</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-xl">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl">
            <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
            <TabsTrigger value="progress" className="rounded-xl">Progress</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl">Reports</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-xl">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Patient Summary */}
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg">Surgery Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Procedure:</span>
                        <span>{patient.surgeryType}</span>
                      </div>
                      <div className="flex justify-between">
  <span className="text-gray-600">Date:</span>
  <span>{surgeryDateDisplay}</span>
</div>
<div className="flex justify-between">
  <span className="text-gray-600">Days Post-Op:</span>
  <Badge variant="secondary">{daysSinceSurgeryDisplay}</Badge>
</div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={`capitalize ${
                          patient.status === 'stable' ? 'bg-green-100 text-green-800' : 
                          patient.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {patient.status === 'stable' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg">Current Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-red-600" />
                          <span className="text-gray-600">Pain Level:</span>
                        </div>
                        <span className="text-lg">{patient.painLevel}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">Temperature:</span>
                        </div>
                        <span className="text-lg">{patient.temperature}°F</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Mobility:</span>
                        </div>
                        <span className="text-lg">{patient.mobility}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
           <Card className="rounded-3xl border-0 shadow-lg">
  <CardHeader>
    <CardTitle>Recent Activity</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {recentActivity.length > 0 ? (
      recentActivity.map((a, i) => (
        <div
          key={i}
          className={`flex items-start space-x-4 p-4 rounded-2xl ${
            a.type === "log"
              ? "bg-blue-50"
              : a.type === "report"
              ? "bg-green-50"
              : "bg-orange-50"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mt-2 ${
              a.type === "log"
                ? "bg-blue-600"
                : a.type === "report"
                ? "bg-green-600"
                : "bg-orange-600"
            }`}
          ></div>
          <div>
            <p className="text-sm">{a.message}</p>
            <p className="text-xs text-gray-500">{timeAgo(a.time)}</p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500 py-4">
        No recent activity yet.
      </p>
    )}
  </CardContent>
</Card>
</TabsContent>

          <TabsContent value="progress" className="mt-6">
  <Card className="rounded-3xl border-0 shadow-lg">
    <CardHeader>
      <CardTitle>Recovery Progress Charts</CardTitle>
    </CardHeader>
    <CardContent className="space-y-8">
      {patient.recoveryHistory && patient.recoveryHistory.length > 0 ? (
        <>
          {/* Pain Level Chart */}
          <div className="space-y-4">
            <h4 className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-600" />
              <span>Pain Level (1-10)</span>
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={patient.recoveryHistory.map((r: any) => ({
                    date: new Date(r.date).toLocaleDateString(),
                    pain: r.pain,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis domain={[0, 10]} stroke="#666" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="pain"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="space-y-4">
            <h4 className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-blue-600" />
              <span>Temperature (°F)</span>
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={patient.recoveryHistory.map((r: any) => ({
                    date: new Date(r.date).toLocaleDateString(),
                    temp: r.temp,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis domain={[97, 102]} stroke="#666" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#2196F3"
                    strokeWidth={3}
                    dot={{ fill: "#2196F3", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mobility Chart */}
          <div className="space-y-4">
            <h4 className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Mobility (%)</span>
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={patient.recoveryHistory.map((r: any) => ({
                    date: new Date(r.date).toLocaleDateString(),
                    mobility: r.mobility,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis domain={[0, 100]} stroke="#666" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mobility"
                    stroke="#4CAF50"
                    strokeWidth={3}
                    dot={{ fill: "#4CAF50", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 py-8">
          No recovery data available yet.
        </p>
      )}
    </CardContent>
  </Card>
</TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Uploaded Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
  {isLoadingReports ? (
    <p className="text-center text-gray-500 py-8">Loading reports...</p>
  ) : reports.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report) => (
        <div key={report._id} className="p-4 bg-gray-50 rounded-2xl space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">{report.size}</span>
          </div>
          <div>
            <h4 className="text-sm">{report.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{report.date}</p>
          </div>
          <div className="flex space-x-2">
  <Button
    variant="outline"
    size="sm"
    className="flex-1 rounded-xl text-xs"
    onClick={() => {
      const url = `http://localhost:5000/${report.filePath}`;
      window.open(url, "_blank");
    }}
  >
    View
  </Button>

  <Button
  variant="outline"
  size="sm"
  className="flex-1 rounded-xl text-xs"
  onClick={() => handleDownload(report._id)}
>
  Download
</Button>
</div>

        </div>
      ))}
    </div>
  ) : (
    <p className="text-center text-gray-500 py-8">No reports uploaded yet.</p>
  )}
</CardContent>

            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-6 space-y-6">
  {/* Add Note */}
  <Card className="rounded-3xl border-0 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Plus className="w-5 h-5 text-primary" />
        <span>Add New Note</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Enter your clinical notes here..."
        className="rounded-xl min-h-[120px]"
      />
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => addNote(true, "high")}
        >
          <Pin className="w-4 h-4 mr-2" />
          Pin Note
        </Button>

        <Button
          onClick={() => addNote()}
          className="rounded-xl"
        >
          Add Note
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* Existing Notes */}
  {/* Existing Notes */}
<Card className="rounded-3xl border-0 shadow-lg">
  <CardHeader>
    <CardTitle className="flex items-center space-x-2">
      <MessageSquare className="w-5 h-5 text-primary" />
      <span>Clinical Notes History</span>
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {notes.length > 0 ? (
      notes.map((note: Note) => (
        <div
          key={note._id}
          className={`p-4 rounded-2xl border-l-4 ${
            note.pinned
              ? "bg-yellow-50 border-yellow-400"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={async () => {
                  try {
                    const res = await apiToggleNotePin(note._id);
                    if (res.success) {
                      setNotes((prev) =>
                        prev
                          .map((n) => (n._id === note._id ? res.data : n))
                          .sort(
                            (a, b) => Number(b.pinned) - Number(a.pinned)
                          )
                      );
                    }console.log("🔁 Toggle pin response:", res);
                  } catch (err) {
                    console.error("❌ Failed to toggle pin:", err);
                  }
                }}
              >
                <Pin
                  className={`w-4 h-4 ${
                    note.pinned ? "text-yellow-600" : "text-gray-400"
                  }`}
                />
              </Button>

              {note.priority === "high" && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 text-xs"
                >
                  Important
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {note.createdAt
                  ? new Date(note.createdAt).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-700">{note.content}</p>
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-500 text-center">
        No notes available yet.
      </p>
    )}
  </CardContent>
</Card>
</TabsContent>

        </Tabs>
      </div>
    </div>
  );
}