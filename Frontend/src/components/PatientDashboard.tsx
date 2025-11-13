import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { AllDoctorNotesScreen } from "./AllDoctorNotesModal";
 import {
  apiListAppointments,
  apiGetLatestRecovery,
  apiListMedications,
  apiListRecoveries,
  apiListDailyLogs,
  apiListRecords,
  apiGetNotesByPatientId,
} from "../api/client";
import {
  Activity,
  Thermometer,
  TrendingUp,
  Plus,
  FileText,
  Upload,
  ClipboardList,
  FolderOpen,
  Bell,
  User,
  Calendar,
  MessageSquare,
  Pill,
  LogOut,
  Clock,
} from "lucide-react";
import { BottomNavigation } from "./BottomNavigation";

// --- Configuration ---
const API_BASE_URL = "http://localhost:5000/api";

// --- Interfaces ---
interface Appointment {
  _id: string;
  title: string;
  doctor: string;
  location?: string;
  dateTime: string;
  notes?: string;
}

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  times?: string[];
  nextDose?: string | Date;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

interface Report {
  _id: string;
  name: string;
  type: "image" | "pdf" | "document";
  date: string;
}

interface PatientDashboardProps {
  user: {
    token?: string;
    name: string;
    surgeryDate: string;
    profileImage?: string;
    _id?: string;
  patientId?: string;
  };
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

// --- Utility ---
const formatUtcToLocal = (utcString: string | Date, includeTime = true) => {
  if (!utcString) return "N/A";
  const date = new Date(utcString);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = includeTime
    ? date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";
  return includeTime ? `${datePart} at ${timePart}` : datePart;
};

export function PatientDashboard({
  user,
  onNavigate,
  onLogout,
}: PatientDashboardProps) {
  // --- State ---
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const fixedUser = {
    ...storedUser,
    _id: storedUser._id || storedUser.id, // normalize backend id field
  };

  // ✅ define this ONCE and globally available in this component
  const patientId =
    fixedUser?.patientId ||
    fixedUser?._id ||
    user?.patientId ||
    user?._id;

  console.log("🧾 Using patientId:", patientId);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averages, setAverages] = useState({ temp: 0, mobility: 0, pain: 0 });
  const [doctorNotes, setDoctorNotes] = useState<any[]>([]);
  const [showAllNotes, setShowAllNotes] = useState(false);
 const authToken = user.token || "";

  // --- Mock / Static ---
  const [mockStats, setMockStats] = useState({
  painLevel: 3,
  temperature: 98.6,
  mobility: 75,
  lastUpdate: "Loading...",
});


  // --- Fetch Dashboard Data ---
 

const fetchDashboardData = useCallback(async () => {
  try {
    setIsLoading(true);
    console.log("🔄 Fetching dashboard data...");
    const latestRes = await apiGetLatestRecovery();
  if (latestRes?.success && latestRes?.data) {
    const lastDate = new Date(latestRes.data.createdAt);
    const diffMs = Date.now() - lastDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    setMockStats((prev) => ({
      ...prev,
      lastUpdate:
        diffHours < 1
          ? "less than an hour ago"
          : diffHours === 1
          ? "1 hour ago"
          : `${diffHours} hours ago`,
    }));
  } else {
    setMockStats((prev) => ({ ...prev, lastUpdate: "No entries yet" }));
  }
    // 🩺 APPOINTMENTS
    const appointmentsRes = await apiListAppointments();
    console.log("Appointments API:", appointmentsRes);

    const appointmentsData = Array.isArray(appointmentsRes?.data)
      ? appointmentsRes.data
      : [];
    setAppointments(appointmentsData);

    // 💊 MEDICATIONS
    const medsRes = await apiListMedications();
    console.log("Medications API:", medsRes);

    const medsData = Array.isArray(medsRes?.data) ? medsRes.data : [];
    setMedications(medsData);

    // 📄 RECOVERY DATA
    const recRes = await apiListRecoveries();
    console.log("📄 Recovery API:", recRes);

    const allRecoveries = Array.isArray(recRes?.data) ? recRes.data : [];

    const validLogs = allRecoveries.filter(
      (r: any) =>
        typeof r.recoveryProgress === "number" && /temp:/i.test(r.notes || "")
    );

    const last10 = [...validLogs]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    const temps = last10.map((r: any) => {
      const match = r.notes?.match(/Temp:\s*([\d.]+)/i);
      return match ? parseFloat(match[1]) : 0;
    });

    const mobilityLevels = last10.map((r: any) => {
      const notes = r.notes?.toLowerCase() || "";
      const activityWeights: Record<string, number> = {
        dress: 15,
        bath: 15,
        walk: 20,
        stairs: 25,
        exercise: 25,
      };
      let total = 0;
      for (const [activity, weight] of Object.entries(activityWeights)) {
        if (notes.includes(activity)) total += weight;
      }
      return Math.min(total, 100);
    });

    const painLevels = last10.map((r: any) =>
      typeof r.recoveryProgress === "number" ? r.recoveryProgress : 0
    );

    const avgTemp =
      temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
    const avgMobility =
      mobilityLevels.length > 0
        ? mobilityLevels.reduce((a, b) => a + b, 0) / mobilityLevels.length
        : 0;
    const avgPain =
      painLevels.length > 0
        ? painLevels.reduce((a, b) => a + b, 0) / painLevels.length
        : 0;

    setAverages({
      temp: Number(avgTemp.toFixed(1)),
      mobility: Number(avgMobility.toFixed(1)),
      pain: Number(avgPain.toFixed(1)),
    });

    // 🗂️ RECORDS
    const recordsRes = await apiListRecords();
    console.log("🗂️ Records API:", recordsRes);

    const rawRecords =
      Array.isArray(recordsRes?.data)
        ? recordsRes.data
        : Array.isArray(recordsRes?.records)
        ? recordsRes.records
        : Array.isArray(recordsRes?.data?.records)
        ? recordsRes.data.records
        : [];

    if (rawRecords.length > 0) {
      setReports(
        rawRecords.map((r: any) => ({
          _id: r._id,
          name:
            r.file?.originalName ||
            r.file?.fileName ||
            r.originalName ||
            "Unnamed Report",
          type: (r.file?.originalName || r.originalName || "")
            .toLowerCase()
            .includes(".pdf")
            ? "pdf"
            : (r.file?.originalName || r.originalName || "").match(
                /\.(png|jpg|jpeg)$/i
              )
            ? "image"
            : "document",
          date: new Date(r.file?.uploadDate || r.createdAt).toLocaleDateString(
            "en-US"
          ),
        }))
      );
    } else {
      console.warn("⚠️ No valid records found in response:", recordsRes);
      setReports([]);
    }

    // 📝 DOCTOR NOTES
   // 📝 DOCTOR NOTES
console.log("🧾 Using patientId for notes:", patientId);


    if (patientId) {
      console.log("🟢 Fetching notes for patient:", patientId);
      const notesRes = await apiGetNotesByPatientId(patientId);
console.log("🩺 Notes API full response:", JSON.stringify(notesRes, null, 2));


      const notesData = Array.isArray(notesRes?.data) ? notesRes.data : [];
      setDoctorNotes(notesData);
    } else {
      console.warn("⚠️ Patient ID missing for notes fetch");
      setDoctorNotes([]);
    }
  } catch (err) {
    console.error("❌ Error loading dashboard data:", err);
  } finally {
    setIsLoading(false);
  }
}, [user]);

useEffect(() => {
  console.log("🩺 Loaded Appointments:", appointments);
  console.log("💊 Loaded Medications:", medications);
  console.log("📄 Loaded Reports:", reports);
}, [appointments, medications, reports]);
useEffect(() => {
  apiListDailyLogs().then(console.log);
}, []);

useEffect(() => {
  fetchDashboardData();
}, [fetchDashboardData]);

  // --- Derived ---
  // --- Safe surgery date parsing ---
// --- Surgery Date Handling ---
// --- Surgery Date Handling (Type-Safe) ---
let surgeryDate: Date | null = null;

console.log("🔍 Raw surgeryDate value:", user?.surgeryDate);

if (user && user.surgeryDate) {
  const dateVal = user.surgeryDate as unknown; // 👈 make TypeScript happy

  if (typeof dateVal === "string" || typeof dateVal === "number") {
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      surgeryDate = parsed;
    } else {
      console.warn("⚠️ Could not parse surgeryDate string:", dateVal);
    }
  } else if (dateVal instanceof Date) {
    surgeryDate = dateVal;
  } else {
    console.warn("⚠️ surgeryDate is in unexpected format:", typeof dateVal, dateVal);
  }
}

const daysSinceSurgery =
  surgeryDate !== null
    ? Math.floor((Date.now() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

const surgeryStatus =
  surgeryDate && daysSinceSurgery !== null
    ? daysSinceSurgery < 0
      ? `Surgery in ${Math.abs(daysSinceSurgery)} days`
      : daysSinceSurgery === 0
      ? "Surgery today!"
      : `Day ${daysSinceSurgery} of recovery`
    : "Surgery date not available";

const formattedSurgeryDate =
  surgeryDate !== null
    ? surgeryDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";

  const nextAppointment = appointments.find(
    (a) => new Date(a.dateTime) > new Date()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg text-primary">Loading personalized data...</p>
      </div>
    );
  }


    // --- Main Dashboard Render ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-green-50/50 pb-20 lg:pb-6">
            
            {/* ============================================================
              HEADER
              ============================================================
            */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={user.profileImage} alt={user.name} />
                                <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:block">
                                <h1 className="text-xl">Good morning, {user.name.split(' ')[0]}!</h1>
                                <p className="text-sm text-gray-600">Day {daysSinceSurgery} of recovery</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('daily-log')} className="rounded-xl">
                                <ClipboardList className="w-4 h-4 mr-2" />Logs
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('medications')} className="rounded-xl">
                                <Pill className="w-4 h-4 mr-2" />Meds
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('appointments')} className="rounded-xl">
                                <Calendar className="w-4 h-4 mr-2" />Appointments
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('reports')} className="rounded-xl">
                                <FolderOpen className="w-4 h-4 mr-2" />Reports
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('profile')} className="rounded-xl">
                                <User className="w-4 h-4 mr-2" />Profile
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('notifications')} className="relative rounded-xl">
                                <Bell className="w-5 h-5" /><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-xl text-red-600 hover:text-red-700">
                                <LogOut className="w-4 h-4 mr-2" />Logout
                            </Button>
                        </div>

                        {/* Mobile Navigation Icons */}
                        <div className="flex items-center space-x-2 lg:hidden">
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('profile')} className="rounded-xl">
                                <User className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('notifications')} className="relative rounded-xl">
                                <Bell className="w-5 h-5" /><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
                
                {/* Welcome Banner */}
                <Card className="bg-gradient-to-r from-primary to-green-600 text-white border-0 rounded-3xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                            <div className="space-y-2">
                                <h2 className="text-2xl">Recovery Progress</h2>

                            </div>
                            <div className="flex items-center space-x-2 text-white/80">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-sm">Trending upward</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats (MOCK DATA) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Activity className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-sm text-gray-600 mb-1">Pain Level</h3>
                            <p className="text-2xl text-gray-900">{averages.pain}/10</p>
                            <Badge variant={averages.pain <= 3 ? 'default' : averages.pain <= 6 ? 'secondary' : 'destructive'} className="mt-2">
                                {averages.pain <= 3 ? 'Good' : averages.pain <= 6 ? 'Moderate' : 'High'}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Thermometer className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-sm text-gray-600 mb-1">Temperature</h3>
                            <p className="text-2xl text-gray-900">{averages.temp}°F</p>
                            <Badge variant="default" className="mt-2 bg-blue-600">Normal</Badge>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-sm text-gray-600 mb-1">Mobility</h3>
                            <p className="text-2xl text-gray-900">{averages.mobility}%</p>
                            <Badge variant="default" className="mt-2 bg-green-600">Improving</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Log Button (MOCK DATA) */}
                <Card className="rounded-3xl border-0 shadow-lg">
                    <CardContent className="p-6">
                        <Button 
                            onClick={() => onNavigate('daily-log')}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 text-lg"
                        >
                            <Plus className="w-6 h-6 mr-3" />
                            Add Daily Log Entry
                        </Button>
                        <p className="text-center text-sm text-gray-500 mt-3">
                            Last entry: {mockStats.lastUpdate}
                        </p>
                    </CardContent>
                </Card>

                {/* Recent Doctor Notes (MOCK DATA) */}
                {/* Recent Doctor Notes (Dynamic) */}
{/* ============================================================
  RECENT DOCTOR NOTES (Dynamic with View All)
  ============================================================ */}
{/* 🩺 Recent Doctor Notes Section */}
<Card className="mt-4">
  <CardHeader className="flex justify-between items-center">
    <CardTitle>Recent Doctor Notes</CardTitle>
    {doctorNotes.length > 2 && (
      <Button
  variant="outline"
  size="sm"
  onClick={() => setShowAllNotes(true)}
>
  View All
</Button>


    )}
  </CardHeader>

  <CardContent>
    {doctorNotes.length === 0 ? (
      <p className="text-gray-500 text-sm">No doctor notes available.</p>
    ) : (
      doctorNotes
        .sort((a, b) => {
          // Sort pinned > high priority > date
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          if (a.priority === "high" && b.priority !== "high") return -1;
          if (a.priority !== "high" && b.priority === "high") return 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        })
        .slice(0, 2)
        .map((note) => (
          <Card
            key={note._id}
            className={`mb-3 p-3 border-l-4 ${
              note.priority === "high"
                ? "border-red-500 bg-red-50"
                : "border-blue-400 bg-blue-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2">
                {note.priority === "high" ? (
                  <Bell className="w-4 h-4 text-red-600 mt-1" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-blue-600 mt-1" />
                )}
                <div>
                  <p
                    className={`text-sm ${
                      note.priority === "high"
                        ? "text-red-800 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                  {note.pinned && (
                    <span className="text-yellow-600 text-xs font-semibold block mt-1">
                      📌 Pinned
                    </span>
                  )}
                </div>
              </div>
              <Badge
                variant={
                  note.priority === "high" ? "destructive" : "secondary"
                }
                className={`ml-2 text-xs ${
                  note.priority === "high"
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {note.priority === "high" ? "⚠️ HIGH" : "Normal"}
              </Badge>
            </div>
          </Card>
        ))
    )}
  </CardContent>
</Card>

                {/* ============================================================
                  NEXT APPOINTMENT (DYNAMIC)
                  ============================================================
                */}
                <Card className="rounded-3xl border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span>Next Appointment</span>
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => onNavigate('appointments')} className="rounded-xl">
                                <Plus className="w-4 h-4 mr-1" />Manage
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {nextAppointment ? (
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg">{nextAppointment.title}</h3>
                                        <p className="text-sm text-gray-600">{nextAppointment.doctor}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatUtcToLocal(nextAppointment.dateTime)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <Switch checked={true} disabled /> 
                                    <Label className="text-xs text-gray-600">Reminder</Label>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 p-4">No upcoming appointments found.</p>
                        )}
                    </CardContent>
                </Card>

                {/* ============================================================
                  MEDICATION REMINDERS (DYNAMIC)
                  ============================================================
                */}
                <Card className="rounded-3xl border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <Pill className="w-5 h-5 text-primary" />
                                <span>Medication Reminders</span>
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => onNavigate('medications')} className="rounded-xl">
                                <Plus className="w-4 h-4 mr-1" />Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {medications.length > 0 ? (
                            medications.map((med) => (
                                <div key={med._id} className="flex items-center justify-between p-3 bg-purple-50 rounded-2xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <Pill className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm">
                                                {med.name} - {med.dosage}
                                            </p>
                                            <p className="text-xs text-gray-600">{med.frequency}</p>
                                            <p className="text-xs text-purple-600 flex items-center space-x-1">
                                                <Clock className="w-3 h-3"/>
                                                <span>Next: {med.nextDose ? formatUtcToLocal(med.nextDose, true).split(' at ')[1] : 'N/A'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Switch checked={med.enabled} disabled/> 
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 p-4">No medications configured.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recovery Progress Summary (MOCK DATA) */}
                <Card className="rounded-3xl border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <span>Recovery Progress</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Overall Recovery</span>
                                    <span className="text-sm">{(10-averages.pain)*10}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-green-600 h-3 rounded-full" style={{ width: `${(10-averages.pain)*10}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Mobility Progress</span>
                                    <span className="text-sm">{averages.mobility}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${averages.mobility}%` }}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="text-center p-3 bg-red-50 rounded-2xl">
                                    <div className="text-2xl text-red-600 mb-1">{averages.pain}</div>
                                    <div className="text-xs text-gray-600">Pain Level</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-2xl">
                                    <div className="text-2xl text-blue-600 mb-1">{averages.temp}°</div>
                                    <div className="text-xs text-gray-600">Temperature</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-2xl">
                                    <div className="text-2xl text-green-600 mb-1">{averages.mobility}%</div>
                                    <div className="text-xs text-gray-600">Mobility</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* ============================================================
                  UPLOADED REPORTS (DYNAMIC)
                  ============================================================
                */}
                <Card className="rounded-3xl border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <FolderOpen className="w-5 h-5 text-primary" />
                                <span>Recent Reports</span>
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={() => onNavigate('reports')} className="rounded-xl">
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {reports.length > 0 ? (
                                reports.slice(0, 3).map((report) => (
                                    <div key={report._id} className="p-3 bg-gray-50 rounded-2xl flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            {report.type === 'image' ? (
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Upload className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">{report.name}</p>
                                            <p className="text-xs text-gray-500">{report.date}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 p-4 sm:col-span-3">No reports available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
{showAllNotes && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white w-full h-full overflow-y-auto rounded-2xl shadow-lg">
      <AllDoctorNotesScreen
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onClose={() => setShowAllNotes(false)} 
      />
      <div className="absolute top-4 right-4">
        <Button
          variant="destructive"
          onClick={() => setShowAllNotes(false)}
          className="rounded-xl"
        >
          Close
        </Button>
      </div>
    </div>
  </div>
)}



            {/* Bottom Navigation (Assumed to be defined elsewhere) */}
            <BottomNavigation 
                activeTab="home" 
                onNavigate={onNavigate}
                onLogout={onLogout}
            />
        </div>
    );
}