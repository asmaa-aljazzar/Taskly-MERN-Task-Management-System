# Taskly - HR Management System

Taskly is a comprehensive HR Management System designed to streamline employee management, team coordination, project tracking, and task assignment for organizations of all sizes.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access](#role-based-access)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Authentication
- JWT-based authentication
- Login with email and password
- Forgot password with email reset link
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
│   │   ├── assets/            # Images and static files
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
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── uploads/           # Uploaded files
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── package.json               # Root package.json (concurrently)
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone the repository

```bash
git clone https://github.com/yourusername/taskly.git
cd taskly
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
NODE_ENV=development
```

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
5. On password reset, a token link is sent to the user's email

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
