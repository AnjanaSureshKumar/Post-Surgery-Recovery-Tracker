// Local storage management
class Storage {
    static keys = {
        USER: 'recovery_tracker_user',
        DAILY_LOGS: 'recovery_tracker_daily_logs',
        NOTIFICATIONS: 'recovery_tracker_notifications',
        PATIENT_STATS: 'recovery_tracker_patient_stats',
        DOCTOR_STATS: 'recovery_tracker_doctor_stats',
        MEDICATIONS: 'recovery_tracker_medications',
        APPOINTMENTS: 'recovery_tracker_appointments'
    };

    // User management
    static setUser(userData) {
        localStorage.setItem(this.keys.USER, JSON.stringify(userData));
    }

    static getUser() {
        const userData = localStorage.getItem(this.keys.USER);
        return userData ? JSON.parse(userData) : null;
    }

    static clearUser() {
        localStorage.removeItem(this.keys.USER);
    }

    // Daily logs
    static saveDailyLog(logData) {
        const logs = this.getDailyLogs();
        logs.push({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...logData
        });
        localStorage.setItem(this.keys.DAILY_LOGS, JSON.stringify(logs));
    }

    static getDailyLogs() {
        const logs = localStorage.getItem(this.keys.DAILY_LOGS);
        return logs ? JSON.parse(logs) : [];
    }

    static getLatestLog() {
        const logs = this.getDailyLogs();
        return logs.length > 0 ? logs[logs.length - 1] : null;
    }

    // Notifications
    static saveNotification(notification) {
        const notifications = this.getNotifications();
        notifications.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        });
        localStorage.setItem(this.keys.NOTIFICATIONS, JSON.stringify(notifications));
    }

    static getNotifications() {
        const notifications = localStorage.getItem(this.keys.NOTIFICATIONS);
        return notifications ? JSON.parse(notifications) : this.getDefaultNotifications();
    }

    static markNotificationAsRead(id) {
        const notifications = this.getNotifications();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            localStorage.setItem(this.keys.NOTIFICATIONS, JSON.stringify(notifications));
        }
    }

    static getUnreadNotificationsCount() {
        const notifications = this.getNotifications();
        return notifications.filter(n => !n.read).length;
    }

    static getDefaultNotifications() {
        return [
            {
                id: 1,
                type: 'medication',
                title: 'Medication Reminder',
                message: 'Time to take your Tramadol (50mg)',
                timestamp: new Date().toISOString(),
                read: false
            },
            {
                id: 2,
                type: 'appointment',
                title: 'Upcoming Appointment',
                message: 'Follow-up appointment tomorrow at 2:00 PM',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                read: false
            },
            {
                id: 3,
                type: 'achievement',
                title: 'Recovery Milestone',
                message: 'Congratulations! You\'ve completed 2 weeks of recovery.',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                read: true
            }
        ];
    }

    // Patient stats
    static getPatientStats() {
        const stats = localStorage.getItem(this.keys.PATIENT_STATS);
        return stats ? JSON.parse(stats) : this.getDefaultPatientStats();
    }

    static updatePatientStats(newStats) {
        const currentStats = this.getPatientStats();
        const updatedStats = { ...currentStats, ...newStats };
        localStorage.setItem(this.keys.PATIENT_STATS, JSON.stringify(updatedStats));
    }

    static getDefaultPatientStats() {
        return {
            daysSinceSurgery: 12,
            recoveryProgress: 85,
            medicationsTaken: '3/4',
            currentPainLevel: 3,
            totalLogEntries: 8,
            averagePainLevel: 3.5,
            medicationCompliance: 95
        };
    }

    // Doctor stats
    static getDoctorStats() {
        const stats = localStorage.getItem(this.keys.DOCTOR_STATS);
        return stats ? JSON.parse(stats) : this.getDefaultDoctorStats();
    }

    static updateDoctorStats(newStats) {
        const currentStats = this.getDoctorStats();
        const updatedStats = { ...currentStats, ...newStats };
        localStorage.setItem(this.keys.DOCTOR_STATS, JSON.stringify(updatedStats));
    }

    static getDefaultDoctorStats() {
        return {
            totalPatients: 24,
            pendingReviews: 7,
            todayAppointments: 5,
            urgentAlerts: 2,
            totalSurgeries: 156,
            successRate: 98.5
        };
    }

    // Medications
    static getMedications() {
        const medications = localStorage.getItem(this.keys.MEDICATIONS);
        return medications ? JSON.parse(medications) : this.getDefaultMedications();
    }

    static saveMedication(medication) {
        const medications = this.getMedications();
        medications.push({
            id: Date.now(),
            ...medication
        });
        localStorage.setItem(this.keys.MEDICATIONS, JSON.stringify(medications));
    }

    static updateMedication(id, updates) {
        const medications = this.getMedications();
        const index = medications.findIndex(med => med.id === id);
        if (index !== -1) {
            medications[index] = { ...medications[index], ...updates };
            localStorage.setItem(this.keys.MEDICATIONS, JSON.stringify(medications));
        }
    }

    static deleteMedication(id) {
        const medications = this.getMedications();
        const filtered = medications.filter(med => med.id !== id);
        localStorage.setItem(this.keys.MEDICATIONS, JSON.stringify(filtered));
    }

    static getDefaultMedications() {
        return [
            {
                id: 1,
                name: 'Amoxicillin',
                dosage: '500mg',
                frequency: 'Daily',
                times: ['08:00'],
                duration: '7 days',
                remaining: 5,
                instructions: 'Take with food',
                active: true,
                taken: true
            },
            {
                id: 2,
                name: 'Ibuprofen',
                dosage: '400mg',
                frequency: 'Twice daily',
                times: ['12:00', '20:00'],
                duration: '14 days',
                remaining: 12,
                instructions: 'Take with meals',
                active: true,
                taken: true
            },
            {
                id: 3,
                name: 'Vitamin D',
                dosage: '1000IU',
                frequency: 'Daily',
                times: ['18:00'],
                duration: 'Ongoing',
                remaining: 30,
                instructions: 'Can be taken any time',
                active: true,
                taken: true
            },
            {
                id: 4,
                name: 'Tramadol',
                dosage: '50mg',
                frequency: 'As needed',
                times: ['22:00'],
                duration: '10 days',
                remaining: 8,
                instructions: 'For severe pain only',
                active: true,
                taken: false
            }
        ];
    }

    // Appointments
    static getAppointments() {
        const appointments = localStorage.getItem(this.keys.APPOINTMENTS);
        return appointments ? JSON.parse(appointments) : this.getDefaultAppointments();
    }

    static saveAppointment(appointment) {
        const appointments = this.getAppointments();
        appointments.push({
            id: Date.now(),
            ...appointment
        });
        localStorage.setItem(this.keys.APPOINTMENTS, JSON.stringify(appointments));
    }

    static updateAppointment(id, updates) {
        const appointments = this.getAppointments();
        const index = appointments.findIndex(apt => apt.id === id);
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...updates };
            localStorage.setItem(this.keys.APPOINTMENTS, JSON.stringify(appointments));
        }
    }

    static deleteAppointment(id) {
        const appointments = this.getAppointments();
        const filtered = appointments.filter(apt => apt.id !== id);
        localStorage.setItem(this.keys.APPOINTMENTS, JSON.stringify(filtered));
    }

    static getDefaultAppointments() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return [
            {
                id: 1,
                title: 'Follow-up Consultation',
                doctor: 'Dr. Smith',
                date: tomorrow.toISOString().split('T')[0],
                time: '14:00',
                type: 'Follow-up',
                location: 'General Surgery Clinic',
                notes: 'Post-operative assessment',
                status: 'scheduled'
            },
            {
                id: 2,
                title: 'Physical Therapy',
                doctor: 'Sarah Johnson, PT',
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                time: '10:00',
                type: 'Therapy',
                location: 'Rehabilitation Center',
                notes: 'Mobility assessment and exercises',
                status: 'scheduled'
            },
            {
                id: 3,
                title: 'Wound Check',
                doctor: 'Dr. Smith',
                date: nextWeek.toISOString().split('T')[0],
                time: '09:30',
                type: 'Check-up',
                location: 'General Surgery Clinic',
                notes: 'Wound healing assessment',
                status: 'scheduled'
            }
        ];
    }

    // Recovery data for charts
    static getRecoveryData() {
        // Generate mock recovery data
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 12); // 12 days ago

        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                painLevel: Math.max(1, 8 - i * 0.5 + Math.random() * 2),
                energyLevel: Math.min(10, 3 + i * 0.6 + Math.random() * 2),
                mobilityScore: Math.min(10, 2 + i * 0.7 + Math.random() * 1.5)
            });
        }

        return data;
    }

    // Clear all data
    static clear() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // Export data
    static exportData() {
        const data = {};
        Object.entries(this.keys).forEach(([key, storageKey]) => {
            data[key] = localStorage.getItem(storageKey);
        });
        return data;
    }

    // Import data
    static importData(data) {
        Object.entries(data).forEach(([key, value]) => {
            if (this.keys[key]) {
                localStorage.setItem(this.keys[key], value);
            }
        });
    }
}