// Notification system
class Notifications {
    static init() {
        this.setupEventListeners();
        console.log('Notifications system initialized');
    }

    static createNotificationContainer() {
        // Use existing container or create new one
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
            console.log('Created notification container');
        }
        return container;
    }

    static setupEventListeners() {
        // Add CSS for notifications
        this.addNotificationStyles();
    }

    static addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                }

                .notification {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }

                .notification.success {
                    border-left: 4px solid var(--primary);
                }

                .notification.error {
                    border-left: 4px solid var(--destructive);
                }

                .notification.warning {
                    border-left: 4px solid #f59e0b;
                }

                .notification.info {
                    border-left: 4px solid var(--secondary);
                }

                .notification-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .notification-title {
                    font-weight: 600;
                    color: var(--foreground);
                }

                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: var(--muted-foreground);
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .notification-close:hover {
                    color: var(--foreground);
                }

                .notification-message {
                    color: var(--muted-foreground);
                    font-size: 0.875rem;
                    line-height: 1.4;
                }

                .notification-icon {
                    margin-right: 0.5rem;
                    width: 20px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .notification-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: var(--primary);
                    transition: width linear;
                }

                @media (max-width: 768px) {
                    .notification-container {
                        left: 20px;
                        right: 20px;
                        max-width: none;
                    }

                    .notification {
                        transform: translateY(-100%);
                    }

                    .notification.show {
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    static show(message, type = 'info', title = null, duration = 5000) {
        const container = this.createNotificationContainer();
        if (!container) {
            console.error('Could not create notification container');
            return;
        }

        const notification = this.createNotification(message, type, title, duration);
        container.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    static createNotification(message, type, title, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const titles = {
            success: title || 'Success',
            error: title || 'Error',
            warning: title || 'Warning',
            info: title || 'Information'
        };

        notification.innerHTML = `
            <div class="notification-header">
                <div style="display: flex; align-items: center;">
                    <i class="${icons[type]} notification-icon"></i>
                    <span class="notification-title">${titles[type]}</span>
                </div>
                <button class="notification-close" onclick="Notifications.removeNotification(this.closest('.notification'))">
                    ×
                </button>
            </div>
            <div class="notification-message">${message}</div>
            ${duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        // Add progress bar animation
        if (duration > 0) {
            const progressBar = notification.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                setTimeout(() => {
                    progressBar.style.width = '0%';
                    progressBar.style.transition = `width ${duration}ms linear`;
                }, 100);
            }
        }

        return notification;
    }

    static removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    static success(message, title = null, duration = 5000) {
        return this.show(message, 'success', title, duration);
    }

    static error(message, title = null, duration = 7000) {
        return this.show(message, 'error', title, duration);
    }

    static warning(message, title = null, duration = 6000) {
        return this.show(message, 'warning', title, duration);
    }

    static info(message, title = null, duration = 5000) {
        return this.show(message, 'info', title, duration);
    }

    static medication(medicationName, time, duration = 0) {
        const message = `Time to take your ${medicationName}`;
        const title = 'Medication Reminder';
        
        const notification = this.show(message, 'info', title, duration);
        
        // Add action buttons for medication notifications
        const actionsDiv = document.createElement('div');
        actionsDiv.style.marginTop = '0.75rem';
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '0.5rem';
        
        const takenBtn = document.createElement('button');
        takenBtn.className = 'btn btn-primary btn-sm';
        takenBtn.textContent = 'Mark Taken';
        takenBtn.style.fontSize = '0.75rem';
        takenBtn.style.padding = '0.25rem 0.5rem';
        takenBtn.onclick = () => {
            this.markMedicationTaken(medicationName, time);
            this.removeNotification(notification);
        };
        
        const snoozeBtn = document.createElement('button');
        snoozeBtn.className = 'btn btn-outline btn-sm';
        snoozeBtn.textContent = 'Snooze 15min';
        snoozeBtn.style.fontSize = '0.75rem';
        snoozeBtn.style.padding = '0.25rem 0.5rem';
        snoozeBtn.onclick = () => {
            this.snoozeMedication(medicationName, time, 15);
            this.removeNotification(notification);
        };
        
        actionsDiv.appendChild(takenBtn);
        actionsDiv.appendChild(snoozeBtn);
        notification.appendChild(actionsDiv);
        
        return notification;
    }

    static markMedicationTaken(medicationName, time) {
        // Update medication status in storage
        const medications = Storage.getMedications();
        const medication = medications.find(med => med.name === medicationName);
        
        if (medication) {
            const today = new Date().toISOString().split('T')[0];
            if (!medication.takenDates) medication.takenDates = {};
            if (!medication.takenDates[today]) medication.takenDates[today] = [];
            
            medication.takenDates[today].push(time);
            Storage.updateMedication(medication.id, medication);
        }
        
        this.success(`${medicationName} marked as taken`);
    }

    static snoozeMedication(medicationName, time, minutes) {
        setTimeout(() => {
            this.medication(medicationName, time);
        }, minutes * 60 * 1000);
        
        this.info(`Reminder snoozed for ${minutes} minutes`);
    }

    static appointment(appointment, minutesBefore = 60) {
        const message = `Appointment with ${appointment.doctor} in ${minutesBefore} minutes`;
        const title = 'Upcoming Appointment';
        
        return this.show(message, 'info', title, 0);
    }

    static clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    static getUnreadCount() {
        return Storage.getUnreadNotificationsCount();
    }

    // Schedule medication reminders
    static scheduleMedicationReminders() {
        const medications = Storage.getMedications();
        const now = new Date();
        
        medications.forEach(medication => {
            if (!medication.active) return;
            
            medication.times.forEach(time => {
                const [hours, minutes] = time.split(':');
                const reminderTime = new Date();
                reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                // If time has passed today, schedule for tomorrow
                if (reminderTime <= now) {
                    reminderTime.setDate(reminderTime.getDate() + 1);
                }
                
                const timeUntilReminder = reminderTime.getTime() - now.getTime();
                
                setTimeout(() => {
                    this.medication(medication.name, time);
                    
                    // Schedule next day's reminder
                    setTimeout(() => {
                        this.medication(medication.name, time);
                    }, 24 * 60 * 60 * 1000);
                }, timeUntilReminder);
            });
        });
    }

    // Schedule appointment reminders
    static scheduleAppointmentReminders() {
        const appointments = Storage.getAppointments();
        const now = new Date();
        
        appointments.forEach(appointment => {
            const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
            const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000); // 1 hour before
            
            if (reminderTime > now) {
                const timeUntilReminder = reminderTime.getTime() - now.getTime();
                
                setTimeout(() => {
                    this.appointment(appointment, 60);
                }, timeUntilReminder);
            }
        });
    }

    // Initialize all scheduled notifications
    static initializeScheduledNotifications() {
        this.scheduleMedicationReminders();
        this.scheduleAppointmentReminders();
    }
}