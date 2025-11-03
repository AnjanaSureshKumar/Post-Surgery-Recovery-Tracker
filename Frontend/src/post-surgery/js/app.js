// Main application controller
class App {
    constructor() {
        this.currentUser = null;
        this.currentRoute = 'login';
        this.userRole = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('Initializing Recovery Tracker App...');
        
        // Check for existing session
        const savedUser = Storage.getUser();
        if (savedUser) {
            this.currentUser = savedUser;
            this.userRole = savedUser.role;
            this.currentRoute = savedUser.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard';
            console.log('Found existing user session:', savedUser.name, '-', savedUser.role);
        }

        // Initialize router
        Router.init(this);
        
        // Initialize notifications system
        Notifications.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial route
        this.navigate(this.currentRoute);
        
        // Initialize scheduled notifications
        if (this.currentUser) {
            Notifications.initializeScheduledNotifications();
        }
        
        this.isInitialized = true;
        console.log('App initialized successfully');
    }

    setupEventListeners() {
        // Listen for login events
        document.addEventListener('userLoggedIn', (e) => {
            this.currentUser = e.detail.user;
            this.userRole = e.detail.role;
            this.currentRoute = e.detail.role === 'patient' ? 'dashboard' : 'doctor-dashboard';
            this.navigate(this.currentRoute);
        });

        // Listen for logout events
        document.addEventListener('userLoggedOut', () => {
            this.logout();
        });

        // Listen for navigation events
        document.addEventListener('navigate', (e) => {
            this.navigate(e.detail.route);
        });
    }

    navigate(route) {
        console.log('Navigating to:', route);
        this.currentRoute = route;
        Router.navigate(route, this.currentUser, this.userRole);
        this.updateNavigationState();
        
        // Add page transition effect
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.classList.add('page-transition');
            setTimeout(() => {
                appContainer.classList.remove('page-transition');
            }, 500);
        }
    }

    updateNavigationState() {
        // Update bottom navigation active state
        const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');
        bottomNavLinks.forEach(link => {
            link.classList.remove('active');
            const linkRoute = link.getAttribute('data-route');
            if (linkRoute === this.currentRoute || 
                (linkRoute === 'dashboard' && (this.currentRoute === 'patient-dashboard' || this.currentRoute === 'doctor-dashboard'))) {
                link.classList.add('active');
            }
        });

        // Update page title
        this.updatePageTitle();
    }

    updatePageTitle() {
        const titles = {
            'login': 'Login - Recovery Tracker',
            'dashboard': 'Dashboard - Recovery Tracker',
            'patient-dashboard': 'Dashboard - Recovery Tracker',
            'doctor-dashboard': 'Doctor Dashboard - Recovery Tracker',
            'daily-log': 'Daily Log - Recovery Tracker',
            'reports': 'Reports - Recovery Tracker',
            'notifications': 'Notifications - Recovery Tracker',
            'profile': 'Profile - Recovery Tracker',
            'medications': 'Medications - Recovery Tracker',
            'appointments': 'Appointments - Recovery Tracker'
        };
        
        document.title = titles[this.currentRoute] || 'Recovery Tracker';
    }

    login(userData, role) {
        console.log('User logged in:', userData.name, '-', role);
        this.currentUser = userData;
        this.userRole = role;
        
        // Save to storage
        Storage.setUser({ ...userData, role });
        
        // Navigate to appropriate dashboard
        const route = role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard';
        this.navigate(route);
        
        // Initialize scheduled notifications for logged in user
        setTimeout(() => {
            Notifications.initializeScheduledNotifications();
            
            // Show a welcome notification for demo
            if (role === 'patient') {
                setTimeout(() => {
                    Notifications.show('Your next medication reminder is in 2 hours', 'info', 'Upcoming Reminder');
                }, 2000);
            }
        }, 1000);
        
        // Show success message
        Notifications.show(`Welcome back, ${userData.name}!`, 'success');
    }

    logout() {
        this.currentUser = null;
        this.userRole = null;
        this.currentRoute = 'login';
        
        // Clear storage
        Storage.clear();
        
        // Navigate to login
        this.navigate('login');
        
        // Show message
        Notifications.show('Logged out successfully', 'info');
    }

    // Utility methods for components to use
    getCurrentUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.userRole;
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Global app instance
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    
    // Make app globally available
    window.app = app;
});

// Global navigation function
function navigateTo(route) {
    if (app) {
        app.navigate(route);
    }
}

// Global logout function
function logout() {
    if (app) {
        app.logout();
    }
}

// Global login function
function login(userData, role) {
    if (app) {
        app.login(userData, role);
    }
}

// Global utility functions for HTML pages
function toggleMedication(medicationId) {
    console.log('Toggling medication:', medicationId);
    const medications = Storage.getMedications();
    const medication = medications.find(med => med.id === medicationId);
    if (medication) {
        medication.taken = !medication.taken;
        Storage.updateMedication(medicationId, { taken: medication.taken });
        
        // Refresh the page
        if (app && app.currentRoute === 'medications') {
            app.navigate('medications');
        }
        
        Notifications.show(
            `${medication.name} marked as ${medication.taken ? 'taken' : 'not taken'}`,
            'success'
        );
    }
}

function viewAppointment(appointmentId) {
    console.log('Viewing appointment:', appointmentId);
    // Implementation for viewing appointment details
}

function viewReport(reportId) {
    console.log('Viewing report:', reportId);
    // Implementation for viewing report details
}

function markNotificationRead(notificationId) {
    console.log('Marking notification as read:', notificationId);
    Storage.markNotificationAsRead(notificationId);
    
    // Refresh notifications page if currently on it
    if (app && app.currentRoute === 'notifications') {
        app.navigate('notifications');
    }
}

function markAllAsRead() {
    console.log('Marking all notifications as read');
    const notifications = Storage.getNotifications();
    notifications.forEach(notif => {
        Storage.markNotificationAsRead(notif.id);
    });
    
    // Refresh notifications page
    if (app && app.currentRoute === 'notifications') {
        app.navigate('notifications');
    }
    
    Notifications.show('All notifications marked as read', 'success');
}

// Modal management functions
function showAddMedicationModal() {
    const modal = document.getElementById('medicationModal');
    if (modal) modal.style.display = 'flex';
}

function closeMedicationModal() {
    const modal = document.getElementById('medicationModal');
    if (modal) modal.style.display = 'none';
}

function showAddAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) modal.style.display = 'flex';
}

function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) modal.style.display = 'none';
}

function showNotificationSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'flex';
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
}

function editProfile() {
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.style.display = 'flex';
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.style.display = 'none';
}

function changePassword() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.style.display = 'flex';
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.style.display = 'none';
}

function cancelUpload() {
    const form = document.getElementById('uploadForm');
    if (form) form.style.display = 'none';
    
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) uploadArea.style.display = 'block';
}

function closeReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) modal.style.display = 'none';
}

function saveNotificationSettings() {
    // Save notification settings
    Notifications.show('Notification settings saved', 'success');
    closeSettingsModal();
}

function exportData() {
    const data = Storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-tracker-data.json';
    a.click();
    URL.revokeObjectURL(url);
    Notifications.show('Data exported successfully', 'success');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        Storage.clear();
        logout();
        Notifications.show('Account deleted successfully', 'info');
    }
}