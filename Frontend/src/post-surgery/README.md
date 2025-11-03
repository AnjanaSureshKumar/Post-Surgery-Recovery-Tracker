# Post-Surgery Recovery Tracker

A comprehensive web application for tracking post-surgery recovery progress, built with pure HTML, CSS, and JavaScript.

## Features

### For Patients
- **Dashboard**: Overview of recovery progress with interactive charts
- **Daily Log**: Record daily symptoms, pain levels, medications, and mood
- **Medication Management**: Track medications with reminders and adherence monitoring
- **Appointment Scheduling**: Manage medical appointments and reminders
- **Reports Upload**: Upload and manage medical documents, X-rays, and reports
- **Progress Tracking**: Visual charts showing recovery trends
- **Notifications**: Smart reminders for medications, appointments, and daily logs

### For Doctors
- **Patient Dashboard**: Monitor multiple patients' recovery progress
- **Patient Management**: Review patient data, logs, and uploaded reports
- **Appointment Scheduling**: Manage patient appointments and consultations
- **Analytics**: Track patient adherence and recovery trends
- **Notes**: Add structured notes and feedback for patients

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome 6
- **Charts**: HTML5 Canvas for data visualization
- **Storage**: LocalStorage for data persistence
- **Responsive Design**: Mobile-first approach

## Project Structure

```
post-surgery/
├── index.html                 # Main entry point
├── css/
│   └── styles.css            # Main stylesheet with all components
├── js/
│   ├── app.js               # Main application controller
│   ├── router.js            # Client-side routing
│   ├── storage.js           # LocalStorage management
│   ├── auth.js              # Authentication system
│   ├── charts.js            # Chart generation
│   ├── notifications.js     # Notification system
│   └── utils.js             # Utility functions
├── pages/
│   ├── login.html           # Login and signup
│   ├── patient-dashboard.html # Patient main dashboard
│   ├── doctor-dashboard.html  # Doctor main dashboard
│   ├── daily-log.html       # Daily recovery log form
│   ├── medications.html     # Medication management
│   ├── appointments.html    # Appointment scheduling
│   ├── reports.html         # Medical reports upload
│   ├── notifications.html   # Notification center
│   └── profile.html         # User profile management
├── components/
│   ├── header.html          # Page header component
│   ├── footer.html          # Page footer component
│   └── bottom-navigation.html # Mobile navigation
└── README.md
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for development: Python, Node.js, or any HTTP server)

### Installation

1. **Clone or download** the project files to your local machine

2. **Serve the files** using a local web server:

   **Option 1: Python (if installed)**
   ```bash
   cd post-surgery
   python -m http.server 8000
   ```

   **Option 2: Node.js (if installed)**
   ```bash
   cd post-surgery
   npx http-server -p 8000
   ```

   **Option 3: Live Server (VS Code extension)**
   - Install Live Server extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

3. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

### Demo Accounts

The application includes demo accounts for testing:

**Patient Account:**
- Email: `patient@demo.com`
- Password: `password`
- Type: Patient

**Doctor Account:**
- Email: `doctor@demo.com`
- Password: `password`
- Type: Doctor

## Usage Guide

### For Patients

1. **Login**: Use the patient demo account or create a new account
2. **Dashboard**: View your recovery overview, medication reminders, and upcoming appointments
3. **Daily Log**: Record your daily recovery progress including:
   - Pain and energy levels (1-10 scale)
   - Mobility status
   - Medications taken
   - Sleep quality
   - Physical activity
   - Symptoms
   - Mood
4. **Medications**: 
   - View today's medication schedule
   - Mark medications as taken
   - Add new medications
   - View adherence reports
5. **Appointments**: 
   - Schedule new appointments
   - View upcoming appointments
   - Calendar view of all appointments
6. **Reports**: Upload medical documents and X-rays
7. **Profile**: Manage personal and medical information

### For Doctors

1. **Login**: Use the doctor demo account
2. **Dashboard**: Monitor all patients, pending reviews, and today's schedule
3. **Patient Management**: Review patient progress and activity
4. **Appointments**: Manage patient appointments and consultations
5. **Analytics**: View patient adherence and recovery trends

## Features Explained

### Smart Notifications
- Medication reminders with snooze functionality
- Appointment reminders (1 hour and 1 day before)
- Daily log reminders
- Recovery milestone celebrations

### Data Visualization
- Interactive recovery progress charts
- Pain and energy level trends
- Medication adherence charts
- Recovery milestone tracking

### Mobile Responsive
- Touch-friendly interface
- Bottom navigation for mobile devices
- Responsive layouts for all screen sizes
- Optimized for both portrait and landscape orientations

### Data Management
- All data stored locally in browser
- Export functionality for data backup
- Import/restore capabilities
- Secure local storage with encryption

## Browser Compatibility

- **Chrome**: 90+ (Recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Customization

### Styling
- Edit `css/styles.css` to customize colors, fonts, and layouts
- CSS variables are used for easy theme customization
- Responsive breakpoints can be adjusted

### Adding Features
- Add new pages in the `pages/` directory
- Update router in `js/router.js` to include new routes
- Add navigation items in `components/bottom-navigation.html`

### Data Storage
- Modify `js/storage.js` to add new data types
- Update forms and components to use new data structures

## Development

### Code Structure
- **Modular Design**: Each feature is separated into its own module
- **Event-Driven**: Uses custom events for component communication
- **Responsive**: Mobile-first CSS approach
- **Accessible**: ARIA labels and keyboard navigation support

### Adding New Pages
1. Create HTML file in `pages/` directory
2. Add route to `js/router.js`
3. Update navigation components if needed
4. Add any required JavaScript functionality

### Extending Storage
1. Add new keys to `Storage.keys` object
2. Create getter/setter methods
3. Update export/import functionality

## Security Considerations

- **Client-Side Only**: All data stored locally in browser
- **No Server Communication**: Completely offline application
- **Demo Purposes**: Not intended for production medical use
- **Data Privacy**: No data leaves the user's device

## Limitations

- **Local Storage**: Data is tied to browser and device
- **No Real-Time Sync**: No multi-device synchronization
- **Demo Application**: Not connected to real medical systems
- **Browser Dependent**: Data lost if browser data is cleared

## Future Enhancements

- Backend integration with real medical systems
- Multi-device synchronization
- Real-time notifications
- Advanced analytics and reporting
- Integration with wearable devices
- Telemedicine features

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For questions or issues, please refer to the code comments or contact the development team.

---

**Note**: This application is for demonstration purposes only and should not be used for actual medical decision-making without proper medical supervision.