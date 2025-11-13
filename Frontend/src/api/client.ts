export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000";


// ✅ Auth header helper
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ------------------ AUTH ------------------

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Define the new expected payload structure (This is correct)
interface LoginPayload {
    email: string;
    password: string;
    // Add the role property
    role: "patient" | "doctor"; 
}

// 🚨 CORRECTED: The apiLogin function now uses API_BASE
export async function apiLogin(credentials: LoginPayload): Promise<any> {
    // 🚨 FIX: Use API_BASE for the full URL, consistent with apiRegister
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials), // credentials now includes email, password, and role
    });
    
    if (!response.ok) {
        // It's generally better to throw the error response itself or a detailed message
        const errorData = await response.json();
        // The backend's message, "email, password, and role are required," will now be in errorData.message
        throw new Error(errorData.message || 'Login failed');
    }
    
    return response.json();
}

// ... (Rest of the file is unchanged and omitted for brevity)
// ------------------ RECOVERY ------------------

export async function apiCreateRecovery(formData: FormData) {
  const headers: HeadersInit = { ...getAuthHeaders() };
  const res = await fetch(`${API_BASE}/api/recovery`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiListRecoveries() {
  const headers: HeadersInit = { ...getAuthHeaders() };
  const res = await fetch(`${API_BASE}/api/recovery`, { headers });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiGetRecovery(id: string) {
  const headers: HeadersInit = { ...getAuthHeaders() };
  const res = await fetch(`${API_BASE}/api/recovery/${id}`, { headers });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiDeleteRecovery(id: string) {
  const headers: HeadersInit = { ...getAuthHeaders() };
  const res = await fetch(`${API_BASE}/api/recovery/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ------------------ MEDICATIONS ------------------

export async function apiListMedications() {
  const res = await fetch(`${API_BASE}/api/medications`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiCreateMedication(payload: {
  name: string;
  dosage: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/api/medications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiUpdateMedication(id: string, payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/medications/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiDeleteMedication(id: string) {
  const res = await fetch(`${API_BASE}/api/medications/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiMarkMedicationTaken(id: string) {
  const res = await fetch(`${API_BASE}/api/medications/${id}/mark-taken`, {
    method: "PATCH",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ------------------ APPOINTMENTS ------------------

export async function apiListAppointments() {
  const res = await fetch(`${API_BASE}/api/appointments`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiCreateAppointment(payload: {
  title: string;
  doctor: string;
  location?: string;
  dateTime: string;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiUpdateAppointment(id: string, payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/appointments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiDeleteAppointment(id: string) {
  const res = await fetch(`${API_BASE}/api/appointments/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ------------------ USERS ------------------

export async function apiGetUser(id: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const res = await fetch(`${API_BASE}/api/users/${id}`, { headers });
  if (!res.ok) throw await res.json();
  return res.json();
}

// ------------------ DAILY LOGS ------------------

export async function apiListDailyLogs() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/recovery`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to fetch recoveries");

    const data = (json.data || []).map((r: any) => {
      const tempMatch = r.notes?.match(/Temp[:\s]*([\d.]+)/i);
      const temperature = tempMatch ? parseFloat(tempMatch[1]) : 0;

      const mobilityMatch = r.notes?.match(/Mobility[:\s]*([\w\s]+)/i);
      const mobilityText = mobilityMatch ? mobilityMatch[1].toLowerCase() : "";

      let mobility = 50;
      if (mobilityText.includes("walk")) mobility = 80;
      else if (mobilityText.includes("dress")) mobility = 70;
      else if (mobilityText.includes("bed")) mobility = 30;
      else if (mobilityText.includes("rest")) mobility = 40;

      const painLevel =
        typeof r.recoveryProgress === "number"
          ? r.recoveryProgress
          : parseFloat(r.recoveryProgress) || 0;

      return {
        _id: r._id,
        temperature,
        mobility,
        painLevel,
        date: r.createdAt || r.followUpDate,
      };
    });

    console.log("📊 Parsed Daily Logs:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ Error fetching daily logs:", err);
    return { success: false, data: [] };
  }
}

// ------------------ ASSIGNMENTS ------------------

export async function apiGetDoctorAssignments(doctorId: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const endpoint =
    doctorId === "my"
      ? `${API_BASE}/api/assignments/my`
      : `${API_BASE}/api/admin/assignments/${doctorId}`;

  const res = await fetch(endpoint, { headers });
  if (!res.ok) throw await res.json();
  return res.json();
}
// ------------------ records ------------------

// ------------------ records ------------------

export async function apiCreateRecord(formData: FormData) {
  const headers: HeadersInit = { ...getAuthHeaders() };

  const res = await fetch(`${API_BASE}/api/records`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiListRecords() {
  const headers: HeadersInit = { ...getAuthHeaders() };

  const res = await fetch(`${API_BASE}/api/records`, { headers });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiGetRecordsByPatientId(patientId: string) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("🚨 No auth token found in localStorage");
    return { success: false, message: "No auth token" };
  }

  const res = await fetch(`${API_BASE}/api/records/patient/${patientId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  console.log("📄 API getRecordsByPatientId response:", data);
  return data;
}
// ✅ api/client.ts

export async function apiAddNote(data: {
  patientId: string;
  content: string;
  pinned?: boolean;
  priority?: string;
}) {
  const token = localStorage.getItem("token") || "";

  const res = await fetch(`${API_BASE}/api/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function apiGetNotesByPatientId(patientId: string) {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${API_BASE}/api/notes/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function apiToggleNotePin(noteId: string) {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${API_BASE}/api/notes/${noteId}/pin`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
// ✅ Fetch the latest recovery entry (for "Last entry" on dashboard)
export async function apiGetLatestRecovery() {
  const headers: HeadersInit = { ...getAuthHeaders() };
  const res = await fetch(`${API_BASE}/api/recovery/latest`, { headers });
  if (!res.ok) throw await res.json();
  return res.json();
}

