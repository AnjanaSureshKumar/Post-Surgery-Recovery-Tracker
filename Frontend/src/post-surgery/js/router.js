// Router for handling navigation between pages
class Router {
    static init(app) {
        this.app = app;
        this.routes = {
            'login': './pages/login.html',
            'dashboard': './pages/patient-dashboard.html',
            'patient-dashboard': './pages/patient-dashboard.html',
            'doctor-dashboard': './pages/doctor-dashboard.html',
            'daily-log': './pages/daily-log.html',
            'reports': './pages/reports.html',
            'notifications': './pages/notifications.html',
            'profile': './pages/profile.html',
            'medications': './pages/medications.html',
            'appointments': './pages/appointments.html'
        };
        
        console.log('Router initialized with routes:', Object.keys(this.routes));
    }

    static async navigate(route, user, userRole) {
        try {
            console.log('Navigating to route:', route, 'User:', user?.name, 'Role:', userRole);
            
            // Check authentication for protected routes
            if (route !== 'login' && !user) {
                console.log('User not authenticated, redirecting to login');
                route = 'login';
            }

            // Redirect based on user role
            if (route === 'dashboard') {
                route = userRole === 'patient' ? 'patient-dashboard' : 'doctor-dashboard';
                console.log('Dashboard route redirected to:', route);
            }

            const pagePath = this.routes[route];
            if (!pagePath) {
                console.error('Route not found:', route);
                this.showErrorPage();
                return;
            }

            // Load the page content
            console.log('Loading page from:', pagePath);
            const response = await fetch(pagePath);
            if (!response.ok) {
                throw new Error(`Failed to load page: ${response.status} ${response.statusText}`);
            }

            const pageContent = await response.text();
            
            // Update the app container
            const appContainer = document.getElementById('app');
            if (!appContainer) {
                console.error('App container not found');
                return;
            }
            
            appContainer.innerHTML = pageContent;
            console.log('Page content loaded successfully');

            // Load common components
            await this.loadCommonComponents(route, user, userRole);

            // Initialize page-specific functionality
            this.initializePage(route, user, userRole);

        } catch (error) {
            console.error('Navigation error:', error);
            this.showErrorPage();
        }
    }

    static async loadCommonComponents(route, user, userRole) {
        // Don't load header/footer for login page
        if (route === 'login') {
            return;
        }

        try {
            // Load header
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                const headerResponse = await fetch('./components/header.html');
                if (headerResponse.ok) {
                    const headerContent = await headerResponse.text();
                    headerContainer.innerHTML = headerContent;
                    this.initializeHeader(user, userRole);
                } else {
                    console.warn('Could not load header component');
                }
            }

            // Load bottom navigation (mobile)
            const bottomNavContainer = document.getElementById('bottom-nav-container');
            if (bottomNavContainer) {
                const bottomNavResponse = await fetch('./components/bottom-navigation.html');
                if (bottomNavResponse.ok) {
                    const bottomNavContent = await bottomNavResponse.text();
                    bottomNavContainer.innerHTML = bottomNavContent;
                    this.initializeBottomNavigation(userRole);
                } else {
                    console.warn('Could not load bottom navigation component');
                }
            }

            // Load footer
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) {
                const footerResponse = await fetch('./components/footer.html');
                if (footerResponse.ok) {
                    const footerContent = await footerResponse.text();
                    footerContainer.innerHTML = footerContent;
                } else {
                    console.warn('Could not load footer component');
                }
            }

        } catch (error) {
            console.error('Error loading common components:', error);
        }
    }

    static initializeHeader(user, userRole) {
        // Update header title based on user role
        const headerTitle = document.getElementById('headerTitle');
        if (headerTitle && user) {
            if (userRole === 'patient') {
                headerTitle.textContent = 'Recovery Tracker';
            } else {
                headerTitle.textContent = 'Doctor Portal';
            }
        }

        // Set up header button event listeners
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => navigateTo('notifications'));
        }

        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => navigateTo('profile'));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Update notification badge
        this.updateNotificationBadge();
    }

    static initializeBottomNavigation(userRole) {
        // Filter navigation items based on user role
        const bottomNavLinks = document.querySelectorAll('.bottom-nav-link');
        
        bottomNavLinks.forEach(link => {
            const route = link.getAttribute('data-route');
            
            // Hide doctor-specific items for patients
            if (userRole === 'patient') {
                // Show all patient navigation items
                link.style.display = 'flex';
            } else {
                // For doctors, modify navigation
                if (route === 'daily-log') {
                    link.querySelector('i').className = 'fas fa-users';
                    link.querySelector('span').textContent = 'Patients';
                    link.setAttribute('data-route', 'patients');
                }
            }

            // Add click event listener
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetRoute = link.getAttribute('data-route');
                navigateTo(targetRoute);
            });
        });
    }

    static updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            const unreadCount = Notifications.getUnreadCount();
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    static initializePage(route, user, userRole) {
        switch (route) {
            case 'login':
                this.initializeLoginPage();
                break;
            case 'patient-dashboard':
                this.initializePatientDashboard(user);
                break;
            case 'doctor-dashboard':
                this.initializeDoctorDashboard(user);
                break;
            case 'daily-log':
                this.initializeDailyLogPage();
                break;
            case 'medications':
                this.initializeMedicationsPage();
                break;
            case 'appointments':
                this.initializeAppointmentsPage();
                break;
            case 'reports':
                this.initializeReportsPage();
                break;
            case 'notifications':
                this.initializeNotificationsPage();
                break;
            case 'profile':
                this.initializeProfilePage();
                break;
            default:
                console.log('No specific initialization for route:', route);
                break;
        }
    }

    static initializeLoginPage() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupFormElement');
        const showSignupBtn = document.getElementById('showSignupBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');

        // Toggle between login and signup
        if (showSignupBtn) {
            showSignupBtn.addEventListener('click', () => {
                document.querySelector('.card').style.display = 'none';
                document.getElementById('signupForm').classList.remove('hidden');
            });
        }

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => {
                document.querySelector('.card').style.display = 'block';
                document.getElementById('signupForm').classList.add('hidden');
            });
        }

        // Handle login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const userType = document.getElementById('userType').value;

                // Simple validation
                if (!email || !password || !userType) {
                    Notifications.show('Please fill in all fields', 'error');
                    return;
                }

                // Mock authentication
                const userData = {
                    id: Date.now(),
                    name: userType === 'patient' ? 'John Doe' : 'Dr. Smith',
                    email: email,
                    role: userType
                };

                login(userData, userType);
            });
        }

        // Handle signup form submission
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('signupName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const userType = document.getElementById('signupUserType').value;

                // Simple validation
                if (!name || !email || !password || !userType) {
                    Notifications.show('Please fill in all fields', 'error');
                    return;
                }

                // Mock registration
                const userData = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    role: userType
                };

                Notifications.show('Account created successfully!', 'success');
                login(userData, userType);
            });
        }
    }

    static initializePatientDashboard(user) {
        console.log('Initializing patient dashboard for:', user?.name);
        
        // Update patient name
        const patientName = document.getElementById('patientName');
        if (patientName && user) {
            patientName.textContent = user.name.split(' ')[0]; // First name only
        }

        // Initialize recovery chart with a delay to ensure DOM is ready
        setTimeout(() => {
            Charts.initRecoveryChart();
        }, 500);

        // Update dashboard stats with mock data
        this.updatePatientStats();
        
        // Load medication reminders for today
        this.loadTodayMedications();
    }

    static initializeDoctorDashboard(user) {
        // Update doctor name
        const doctorName = document.getElementById('doctorName');
        if (doctorName && user) {
            doctorName.textContent = user.name.replace('Dr. ', '');
        }

        // Update dashboard stats with mock data
        this.updateDoctorStats();
    }

    static initializeDailyLogPage() {
        console.log('Initializing daily log page...');
        
        // Set current date
        const currentDate = document.getElementById('currentDate');
        if (currentDate) {
            currentDate.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Initialize pain level slider
        const painLevel = document.getElementById('painLevel');
        const painValue = document.getElementById('painValue');
        if (painLevel && painValue) {
            painLevel.addEventListener('input', () => {
                painValue.textContent = painLevel.value;
                painValue.style.color = this.getPainColor(painLevel.value);
            });
        }

        // Initialize energy level slider
        const energyLevel = document.getElementById('energyLevel');
        const energyValue = document.getElementById('energyValue');
        if (energyLevel && energyValue) {
            energyLevel.addEventListener('input', () => {
                energyValue.textContent = energyLevel.value;
                energyValue.style.color = this.getEnergyColor(energyLevel.value);
            });
        }

        // Initialize mood selection
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                moodButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                const selectedMoodInput = document.getElementById('selectedMood');
                if (selectedMoodInput) {
                    selectedMoodInput.value = btn.dataset.mood;
                }
            });
        });

        // Handle form submission
        const dailyLogForm = document.getElementById('dailyLogForm');
        if (dailyLogForm) {
            dailyLogForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validate required fields
                const mood = document.getElementById('selectedMood')?.value;
                if (!mood) {
                    Notifications.show('Please select your mood for today', 'warning');
                    return;
                }
                
                // Collect form data
                const formData = {
                    date: new Date().toISOString().split('T')[0],
                    painLevel: document.getElementById('painLevel')?.value || 5,
                    energyLevel: document.getElementById('energyLevel')?.value || 5,
                    mobility: document.getElementById('mobility')?.value || '',
                    sleepQuality: document.getElementById('sleepQuality')?.value || '',
                    exercise: document.getElementById('exercise')?.value || '',
                    woundCare: document.getElementById('woundCare')?.value || '',
                    notes: document.getElementById('notes')?.value || '',
                    mood: mood,
                    medications: this.getSelectedMedications(),
                    symptoms: this.getSelectedSymptoms()
                };

                // Save to storage
                Storage.saveDailyLog(formData);
                
                // Show success animation
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.classList.add('success-animation');
                    setTimeout(() => {
                        submitBtn.classList.remove('success-animation');
                    }, 600);
                }
                
                Notifications.show('Daily log entry saved successfully!', 'success');
                
                // Navigate back to dashboard after short delay
                setTimeout(() => {
                    navigateTo('dashboard');
                }, 1000);
            });
        }
    }
    
    static getPainColor(value) {
        const val = parseInt(value);
        if (val <= 3) return '#4CAF50';
        if (val <= 6) return '#FFC107';
        return '#ef4444';
    }
    
    static getEnergyColor(value) {
        const val = parseInt(value);
        if (val <= 3) return '#ef4444';
        if (val <= 6) return '#FFC107';
        return '#4CAF50';
    }

    static getSelectedMedications() {
        const medications = [];
        const checkboxes = document.querySelectorAll('input[id^="med"]:checked');
        checkboxes.forEach(checkbox => {
            medications.push(checkbox.nextElementSibling.textContent);
        });
        return medications;
    }

    static getSelectedSymptoms() {
        const symptoms = [];
        const checkboxes = document.querySelectorAll('input[id^="symptom"]:checked');
        checkboxes.forEach(checkbox => {
            symptoms.push(checkbox.nextElementSibling.textContent);
        });
        return symptoms;
    }

    static updatePatientStats() {
        // Mock data updates
        const stats = Storage.getPatientStats();
        
        if (document.getElementById('daysSinceSurgery')) {
            document.getElementById('daysSinceSurgery').textContent = stats.daysSinceSurgery;
        }
        if (document.getElementById('recoveryProgress')) {
            document.getElementById('recoveryProgress').textContent = stats.recoveryProgress + '%';
        }
        if (document.getElementById('medicationsTaken')) {
            document.getElementById('medicationsTaken').textContent = stats.medicationsTaken;
        }
        if (document.getElementById('currentPainLevel')) {
            document.getElementById('currentPainLevel').textContent = stats.currentPainLevel;
        }
    }

    static updateDoctorStats() {
        // Mock data updates
        const stats = Storage.getDoctorStats();
        
        if (document.getElementById('totalPatients')) {
            document.getElementById('totalPatients').textContent = stats.totalPatients;
        }
        if (document.getElementById('pendingReviews')) {
            document.getElementById('pendingReviews').textContent = stats.pendingReviews;
        }
        if (document.getElementById('todayAppointments')) {
            document.getElementById('todayAppointments').textContent = stats.todayAppointments;
        }
        if (document.getElementById('urgentAlerts')) {
            document.getElementById('urgentAlerts').textContent = stats.urgentAlerts;
        }
    }

    static initializeMedicationsPage() {
        console.log('Initializing medications page...');
        this.loadMedicationsData();
        this.setupMedicationEventListeners();
    }

    static initializeAppointmentsPage() {
        console.log('Initializing appointments page...');
        this.loadAppointmentsData();
        this.setupAppointmentEventListeners();
    }

    static initializeReportsPage() {
        console.log('Initializing reports page...');
        this.loadReportsData();
        this.setupReportEventListeners();
    }

    static initializeNotificationsPage() {
        console.log('Initializing notifications page...');
        this.loadNotificationsData();
        this.setupNotificationEventListeners();
    }

    static initializeProfilePage() {
        console.log('Initializing profile page...');
        this.loadProfileData();
        this.setupProfileEventListeners();
    }

    static loadMedicationsData() {
        const medications = Storage.getMedications();
        const today = new Date().toISOString().split('T')[0];
        
        // Update today's date
        const todayDate = document.getElementById('todayDate');
        if (todayDate) {
            todayDate.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Load today's medications
        const todayMeds = document.getElementById('todayMedications');
        if (todayMeds && medications) {
            todayMeds.innerHTML = medications.map(med => `
                <div class="medication-card ${this.getMedicationStatus(med)}">
                    <div class="medication-header">
                        <div class="medication-info">
                            <div class="medication-name">${med.name}</div>
                            <div class="medication-dosage">${med.dosage}</div>
                        </div>
                        <div class="medication-actions">
                            <button class="btn btn-sm ${med.taken ? 'btn-primary' : 'btn-outline'}" 
                                    onclick="toggleMedication(${med.id})">
                                ${med.taken ? 'Taken' : 'Mark Taken'}
                            </button>
                        </div>
                    </div>
                    <div class="medication-schedule">
                        ${med.times.map(time => `
                            <span class="schedule-time ${this.getTimeStatus(time, med)}">
                                <i class="fas fa-clock"></i>
                                ${Utils.formatTime(time)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    static loadAppointmentsData() {
        const appointments = Storage.getAppointments();
        
        // Load upcoming appointments
        const upcomingContainer = document.getElementById('upcomingAppointments');
        if (upcomingContainer && appointments) {
            const upcoming = appointments.filter(apt => new Date(apt.date) >= new Date());
            upcomingContainer.innerHTML = upcoming.slice(0, 3).map(apt => `
                <div class="appointment-card upcoming" onclick="viewAppointment(${apt.id})">
                    <div class="appointment-header">
                        <div class="appointment-info">
                            <div class="appointment-title">${apt.title}</div>
                            <div class="appointment-doctor">${apt.doctor}</div>
                            <div class="appointment-datetime">
                                <div class="appointment-date">
                                    <i class="fas fa-calendar"></i>
                                    ${Utils.formatDate(apt.date, 'long')}
                                </div>
                                <div class="appointment-time">
                                    <i class="fas fa-clock"></i>
                                    ${Utils.formatTime(apt.time)}
                                </div>
                            </div>
                        </div>
                        <span class="appointment-status ${apt.status}">${apt.status}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    static loadReportsData() {
        // Load sample reports data
        const reportsContainer = document.getElementById('reportsList');
        if (reportsContainer) {
            const sampleReports = [
                {
                    id: 1,
                    title: 'Post-Op X-Ray',
                    type: 'xray',
                    date: '2024-03-15',
                    doctor: 'Dr. Smith',
                    size: '2.1 MB'
                },
                {
                    id: 2,
                    title: 'Blood Work Results',
                    type: 'bloodwork',
                    date: '2024-03-10',
                    doctor: 'Lab Services',
                    size: '456 KB'
                }
            ];

            reportsContainer.innerHTML = sampleReports.map(report => `
                <div class="report-card" onclick="viewReport(${report.id})">
                    <div class="report-preview">
                        <i class="fas fa-file-medical text-4xl text-primary"></i>
                        <span class="report-type-badge">${report.type}</span>
                    </div>
                    <div class="report-info">
                        <div class="report-title">${report.title}</div>
                        <div class="report-meta">${Utils.formatDate(report.date)} • ${report.doctor}</div>
                        <div class="report-meta">${report.size}</div>
                        <div class="report-actions">
                            <button class="btn btn-sm btn-outline">
                                <i class="fas fa-eye mr-1"></i>
                                View
                            </button>
                            <button class="btn btn-sm btn-primary">
                                <i class="fas fa-download mr-1"></i>
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    static loadNotificationsData() {
        const notifications = Storage.getNotifications();
        const container = document.getElementById('notificationsList');
        
        if (container && notifications) {
            container.innerHTML = notifications.map(notif => `
                <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="markNotificationRead(${notif.id})">
                    <div class="notification-icon ${notif.type}">
                        <i class="fas fa-${this.getNotificationIcon(notif.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-time">${Utils.getTimeFromNow(notif.timestamp)}</div>
                    </div>
                    ${!notif.read ? '<div class="notification-dot"></div>' : ''}
                </div>
            `).join('');
        }
    }

    static loadProfileData() {
        const user = Storage.getUser();
        if (!user) return;

        // Update profile information
        const fields = {
            'profileName': user.name,
            'profileEmail': user.email,
            'fullName': user.name,
            'emailAddress': user.email,
            'userRole': user.role === 'patient' ? 'Patient' : 'Doctor'
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    static setupMedicationEventListeners() {
        // Add medication form handling and other events
    }

    static setupAppointmentEventListeners() {
        // Add appointment form handling and other events
    }

    static setupReportEventListeners() {
        // Add report upload and viewing events
    }

    static setupNotificationEventListeners() {
        // Add notification management events
    }

    static setupProfileEventListeners() {
        // Add profile editing events
    }

    static getMedicationStatus(med) {
        return med.taken ? 'taken' : 'pending';
    }

    static getTimeStatus(time, med) {
        return med.taken ? 'taken' : 'pending';
    }

    static getNotificationIcon(type) {
        const icons = {
            medication: 'pills',
            appointment: 'calendar',
            achievement: 'trophy',
            reminder: 'bell'
        };
        return icons[type] || 'info';
    }

    static loadTodayMedications() {
        const medications = Storage.getMedications();
        const medicationContainer = document.getElementById('medicationReminders');
        
        if (medicationContainer && medications) {
            medicationContainer.innerHTML = medications.map(med => `
                <div class="p-4 border rounded-lg ${med.taken ? '' : 'bg-yellow-50'}">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium">${med.name}</h4>
                        <span class="text-sm ${med.taken ? 'text-primary' : 'text-yellow-600'}">
                            ${med.taken ? '✓ Taken' : '⏰ Due'}
                        </span>
                    </div>
                    <p class="text-sm text-muted">${med.dosage} - ${med.times[0]}</p>
                    ${!med.taken ? `<button class="btn btn-sm btn-primary mt-2 w-full" onclick="toggleMedication(${med.id})">Mark Taken</button>` : ''}
                </div>
            `).join('');
        }
    }

    static showErrorPage() {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
            <div class="min-h-screen bg-gradient flex items-center justify-center p-4">
                <div class="card w-full max-w-md text-center">
                    <div class="card-content">
                        <i class="fas fa-exclamation-triangle text-destructive text-4xl mb-4"></i>
                        <h2 class="text-xl font-bold mb-2">Page Not Found</h2>
                        <p class="text-muted mb-6">The page you're looking for could not be loaded.</p>
                        <button class="btn btn-primary" onclick="navigateTo('login')">
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}