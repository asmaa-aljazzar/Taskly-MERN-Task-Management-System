# Taskly - HR Management System

Taskly is a comprehensive HR Management System designed to streamline employee management, team coordination, project tracking, and task assignment for organisations of all sizes.

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Create demo data](#create-demo-data)
- [Running the Application](#-running-the-application)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access](#role-based-access)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Authentication
- JWT-based authentication
- Login with email and password
- Forgot-password flow with a reset link printed in the backend console
- Secure password reset with token validation
- Password requirements: 8+ characters, uppercase, lowercase, number, special character

### Role-Based Dashboards

#### HR Dashboard
- View total users, employees, managers, and HR staff
- Manage employees (Create, Edit, Delete)
- Manage teams (Create, Edit, Delete)
- View projects and tasks overview
- User distribution charts and analytics

#### Manager Dashboard
- View assigned teams
- Manage projects (Create, Edit, Delete)
- Manage tasks (Create, Edit, Delete)
- Track team progress and workload

#### Employee Dashboard
- View assigned tasks
- Update task progress
- View personal profile
- Track task completion status

### Core Features
- 📊 Interactive charts and analytics
- 👥 Team management
- 📋 Project tracking
- ✅ Task assignment and tracking
- 🔐 Role-based access control
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## 📸 Screenshots

### Authentication

| Login | Forgot Password | Reset Password |
|-------|----------------|----------------|
| ![Login](screenshots/login.png) | ![Forgot Password](screenshots/forgot-password.png) | ![Reset Password](screenshots/reset-password.png) |

---

### HR Role

**Dashboard & Employees**

| HR Dashboard | Employees | Create Employee |
|-------------|-----------|-----------------|
| ![HR Dashboard](screenshots/hr-dashboard.png) | ![HR Employees](screenshots/hr-employees.png) | ![Create Employee](screenshots/hr-create-employee.png) |

**Teams**

| Teams | Team Details | Create Team |
|-------|-------------|-------------|
| ![HR Teams](screenshots/hr-teams.png) | ![Team Details](screenshots/hr-team-details.png) | ![Create Team](screenshots/hr-create-team.png) |

**Profile**

![HR Profile](screenshots/hr-profile.png)

---

### Manager Role

**Dashboard & Teams**

| Manager Dashboard | My Teams | My Teams & Projects |
|------------------|----------|---------------------|
| ![Manager Dashboard](screenshots/manager-dashboard.png) | ![My Teams](screenshots/manager-my-teams.png) | ![Teams & Projects](screenshots/manager-my-teams-projects.png) |

**Projects & Tasks**

| Projects | Create Project | Project Details | Task Details |
|----------|---------------|-----------------|--------------|
| ![Projects](screenshots/manager-projects.png) | ![Create Project](screenshots/manager-create-project.png) | ![Project Details](screenshots/manager-project-details.png) | ![Task Details](screenshots/manager-task-details.png) |

**Profile**

![Manager Profile](screenshots/manager-profile.png)

---

### Employee Role

| Dashboard | My Tasks | Task Details | Profile |
|-----------|----------|--------------|---------|
| ![Employee Dashboard](screenshots/employee-dashboard.png) | ![My Tasks](screenshots/employee-my-tasks.png) | ![Task Details](screenshots/employee-task-details.png) | ![Profile](screenshots/employee-profile.png) |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router v7** - Navigation and routing
- **Tailwind CSS v4** - Styling
- **Axios** - HTTP requests
- **React Hot Toast** - Notifications
- **Recharts** - Charts and analytics
- **React Icons** - Icons
- **Moment.js** - Date formatting and manipulation
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer** - File uploads
- **ExcelJS** - Excel file generation
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

## 📁 Project Structure

```bash
Taskly/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── assests/           # Images and static files
│   │   ├── components/        # Reusable components
│   │   │   ├── inputs/        # Form inputs
│   │   │   └── layouts/       # Layout components
│   │   ├── context/           # React Context API
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   │   ├── Auth/          # Authentication pages
│   │   │   ├── Hr/            # HR pages
│   │   │   ├── Manager/       # Manager pages
│   │   │   └── Employee/      # Employee pages
│   │   ├── routes/            # Route configuration
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── backend/                   # Express backend application
│   ├── config/                # Configuration files
│   ├── controllers/           # Request handlers
│   ├── middlewares/           # Custom middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── uploads/               # Uploaded files
│   ├── utils/                 # Utility functions
│   ├── server.js              # API entry point
│   ├── seed.js                # Demo-data generator
│   └── package.json
│
├── screenshots/               # App screenshots
├── package.json               # Root package.json (concurrently)
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js 20.19 or higher (or 22.12 or higher)
- MongoDB (local or Atlas)
- npm

### Step 1: Clone the repository

```bash
git clone https://github.com/asmaa-aljazzar/Taskly-MERN-Task-Management-System.git
cd Taskly-MERN-Task-Management-System
```

### Step 2: Install dependencies

Install all dependencies (frontend + backend):

```bash
npm run install:all
```

Or install separately:

```bash
npm install --prefix frontend
npm install --prefix backend
```

## 🔧 Environment Variables

Create a `.env` file inside the `backend/` folder with the following:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Create `frontend/.env` as well:

```env
VITE_API_URL=http://localhost:8000
```

You can copy the included `.env.example` file in each folder and replace its placeholder values. Never commit real secrets.

## Create demo data

### Create demo accounts and data

After setting `MONGO_URI` in `backend/.env`, create a complete linked demo dataset:

```bash
npm run seed
```

The default dataset contains 1 HR account, 5 managers, 50 employees, 10 teams,
40 projects, and 800 tasks. All demo accounts use the password `Taskly@123`.
The main logins are `hr@seed.taskly.local`, `manager1@seed.taskly.local`, and
`employee1@seed.taskly.local`.

To replace an earlier demo dataset without touching accounts created through the app:

```bash
npm run seed:reset
```

You can choose a larger dataset and set a password through the environment:

```bash
SEED_PASSWORD='YourStrongPassword@123' npm run seed:reset -- --managers=10 --employees=500 --teams=25 --projects-per-team=8 --tasks-per-project=40
```

Do not run the seed command automatically when the production server starts. Run it
once against the intended database, then remove `SEED_PASSWORD` from the hosting
environment if you set it there.

Use any of the listed demo email addresses and the demo password to sign in.

## 🏃 Running the Application

### Development mode (frontend + backend together)

```bash
npm run dev
```

This starts both servers concurrently:

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:8000 |

### Run separately

```bash
# Frontend only
npm run dev --prefix frontend

# Backend only
npm run dev --prefix backend
```

### Production build

```bash
npm run build
```

## Authentication Flow

1. User submits login credentials (email + password)
2. Backend validates credentials and returns a signed JWT
3. Frontend stores the JWT and attaches it to subsequent API requests
4. Protected routes check the JWT via middleware on the backend
5. During local development, the backend prints the password-reset link in its console; email delivery is not yet configured

## Role-Based Access

| Role     | Access Level                                              |
|----------|-----------------------------------------------------------|
| HR       | Full access — manage users, teams, projects, and tasks    |
| Manager  | Manage projects and tasks within assigned teams           |
| Employee | View and update progress on personally assigned tasks     |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
