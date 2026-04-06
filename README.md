```text
src/
│
├── App.jsx                     # Main Router: Decides which page to show
├── firebase.js                 # Firebase Configuration (API Keys)
├── main.jsx                    # Application Entry Point
│
├── components/                 # All UI Components
│   │
│   ├── Dashboard.css           # GLOBAL STYLES: Contains the Royal Blue theme variables
│   │
│   ├── admin/                  # ADMIN 
│   │   ├── AdminLayout.jsx     # Sidebar & Topbar specific to Admin
│   │   ├── AdminDashboard.jsx  # Main Stats & Company Management Table
│   │   └── AddCompany.jsx      # Form to register new schools
│   │
│   ├── company/                # COMPANY ADMIN OR USER
│   │   ├── CompanyLayout.jsx   # Sidebar & Topbar specific to School Admins
│   │   ├── CompanyDashboard.jsx# Stats for Students/Teachers
│   │   ├── AddStudent.jsx      # Form to enroll students
│   │   ├── AddTeacher.jsx      # Form to onboard faculty
│   │   └── QuestionBank.jsx    # Drag & Drop area for exam files
│   │
│   └── auth/                   # AUTHENTICATION
│       ├── Login.jsx           # Logic to redirect Admin vs. User
│       ├── Register.jsx        # Create account 
│       └── Login.css           # Specific styles for the login page
