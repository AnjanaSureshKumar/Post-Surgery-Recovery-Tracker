// Authentication and user management
class Auth {
    static currentUser = null;
    static isLoggedIn = false;

    // Initialize authentication system
    static init() {
        this.checkExistingSession();
        this.setupEventListeners();
    }

    // Check for existing user session
    static checkExistingSession() {
        const user = Storage.getUser();
        if (user) {
            this.currentUser = user;
            this.isLoggedIn = true;
        }
    }

    // Set up authentication event listeners
    static setupEventListeners() {
        // Listen for login events
        document.addEventListener('login', this.handleLogin.bind(this));
        document.addEventListener('logout', this.handleLogout.bind(this));
    }

    // Handle login
    static handleLogin(event) {
        const { userData, userType } = event.detail;
        this.login(userData, userType);
    }

    // Handle logout
    static handleLogout() {
        this.logout();
    }

    // Login user
    static login(userData, userType) {
        const user = {
            ...userData,
            role: userType,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };

        this.currentUser = user;
        this.isLoggedIn = true;

        // Save to storage
        Storage.setUser(user);

        // Dispatch login event
        document.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { user, role: userType }
        }));

        return user;
    }

    // Logout user
    static logout() {
        this.currentUser = null;
        this.isLoggedIn = false;

        // Clear storage
        Storage.clearUser();

        // Dispatch logout event
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
    }

    // Register new user
    static register(userData, userType) {
        // In a real application, this would make an API call
        // For now, we'll just simulate registration
        
        const validationResult = this.validateRegistrationData(userData);
        if (!validationResult.isValid) {
            throw new Error(validationResult.errors.join(', '));
        }

        const user = {
            id: this.generateUserId(),
            name: userData.name,
            email: userData.email,
            role: userType,
            registrationDate: new Date().toISOString(),
            isActive: true
        };

        // Save user data (in real app, this would be sent to server)
        this.saveUserProfile(user);

        return this.login(user, userType);
    }

    // Validate registration data
    static validateRegistrationData(userData) {
        const errors = [];

        if (!userData.name || userData.name.trim().length === 0) {
            errors.push('Name is required');
        }

        if (!userData.email || !Utils.validateEmail(userData.email)) {
            errors.push('Valid email is required');
        }

        if (!userData.password || !Utils.validatePassword(userData.password)) {
            errors.push('Password must be at least 6 characters long');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Check if user is authenticated
    static isAuthenticated() {
        return this.isLoggedIn && this.currentUser !== null;
    }

    // Get current user
    static getCurrentUser() {
        return this.currentUser;
    }

    // Get user role
    static getUserRole() {
        return this.currentUser?.role;
    }

    // Check if user has specific role
    static hasRole(role) {
        return this.getUserRole() === role;
    }

    // Update user profile
    static updateProfile(updates) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        this.currentUser = { ...this.currentUser, ...updates };
        Storage.setUser(this.currentUser);

        // Dispatch profile update event
        document.dispatchEvent(new CustomEvent('userProfileUpdated', {
            detail: { user: this.currentUser }
        }));

        return this.currentUser;
    }

    // Change password
    static changePassword(currentPassword, newPassword) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        // In a real application, verify current password with server
        if (!Utils.validatePassword(newPassword)) {
            throw new Error('New password must be at least 6 characters long');
        }

        // Update password (in real app, this would be sent to server)
        this.currentUser.passwordLastChanged = new Date().toISOString();
        Storage.setUser(this.currentUser);

        Notifications.success('Password changed successfully');
        return true;
    }

    // Reset password
    static resetPassword(email) {
        if (!Utils.validateEmail(email)) {
            throw new Error('Valid email is required');
        }

        // In a real application, this would send a reset email
        Notifications.info('Password reset instructions sent to your email');
        return true;
    }

    // Save user profile data
    static saveUserProfile(user) {
        // In a real application, this would save to database
        const profiles = JSON.parse(localStorage.getItem('user_profiles') || '{}');
        profiles[user.id] = user;
        localStorage.setItem('user_profiles', JSON.stringify(profiles));
    }

    // Load user profile data
    static loadUserProfile(userId) {
        const profiles = JSON.parse(localStorage.getItem('user_profiles') || '{}');
        return profiles[userId] || null;
    }

    // Generate unique user ID
    static generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate session ID
    static generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Session management
    static extendSession() {
        if (this.isAuthenticated()) {
            this.currentUser.lastActivity = new Date().toISOString();
            Storage.setUser(this.currentUser);
        }
    }

    static isSessionExpired() {
        if (!this.isAuthenticated()) return true;

        const lastActivity = new Date(this.currentUser.lastActivity || this.currentUser.loginTime);
        const now = new Date();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

        return (now.getTime() - lastActivity.getTime()) > sessionDuration;
    }

    static checkSessionExpiry() {
        if (this.isSessionExpired()) {
            this.logout();
            Notifications.warning('Your session has expired. Please log in again.');
            return false;
        }
        return true;
    }

    // Demo users for testing
    static createDemoUsers() {
        const demoUsers = [
            {
                id: 'demo_patient_1',
                name: 'John Doe',
                email: 'patient@demo.com',
                role: 'patient',
                isDemo: true
            },
            {
                id: 'demo_doctor_1',
                name: 'Dr. Smith',
                email: 'doctor@demo.com',
                role: 'doctor',
                isDemo: true
            }
        ];

        demoUsers.forEach(user => this.saveUserProfile(user));
        return demoUsers;
    }

    // Login with demo account
    static loginDemo(role) {
        const demoUsers = this.createDemoUsers();
        const demoUser = demoUsers.find(user => user.role === role);
        
        if (demoUser) {
            return this.login(demoUser, role);
        } else {
            throw new Error('Demo user not found');
        }
    }

    // Permissions and access control
    static canAccessRoute(route) {
        if (!this.isAuthenticated()) {
            return route === 'login';
        }

        const userRole = this.getUserRole();
        const roleBasedRoutes = {
            patient: [
                'dashboard', 'patient-dashboard', 'daily-log', 'reports', 
                'notifications', 'profile', 'medications', 'appointments'
            ],
            doctor: [
                'dashboard', 'doctor-dashboard', 'patients', 'reports',
                'notifications', 'profile', 'appointments'
            ]
        };

        return roleBasedRoutes[userRole]?.includes(route) || false;
    }

    // Get user permissions
    static getUserPermissions() {
        const role = this.getUserRole();
        const permissions = {
            patient: [
                'view_own_data',
                'create_daily_log',
                'upload_reports',
                'view_medications',
                'manage_appointments',
                'update_profile'
            ],
            doctor: [
                'view_all_patients',
                'view_patient_data',
                'create_notes',
                'manage_appointments',
                'update_profile',
                'access_analytics'
            ]
        };

        return permissions[role] || [];
    }

    // Check if user has specific permission
    static hasPermission(permission) {
        const userPermissions = this.getUserPermissions();
        return userPermissions.includes(permission);
    }
}

// Initialize authentication when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});