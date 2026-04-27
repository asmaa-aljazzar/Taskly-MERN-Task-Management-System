# Taskly - HR Management System

Taskly is a comprehensive HR Management System designed to streamline employee management, team coordination, project tracking, and task assignment for organizations of all sizes.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access](#role-based-access)
- [Screenshots](#screenshots)
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

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation and routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP requests
- **React Hot Toast** - Notifications
- **Recharts** - Charts and analytics
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email sending

## 📁 Project Structure
```bash
Taskly/
├── frontend/ # React frontend application
│ ├── src/
│ │ ├── assets/ # Images and static files
│ │ ├── components/ # Reusable components
│ │ │ ├── inputs/ # Form inputs
│ │ │ └── layouts/ # Layout components
│ │ ├── context/ # React Context API
│ │ ├── hooks/ # Custom hooks
│ │ ├── pages/ # Page components
│ │ │ ├── Auth/ # Authentication pages
│ │ │ ├── Hr/ # HR pages
│ │ │ ├── Manager/ # Manager pages
│ │ │ └── Employee/ # Employee pages
│ │ ├── routes/ # Route configuration
│ │ └── utils/ # Utility functions
│ └── package.json
│
├── backend/ # Express backend application
│ ├── src/
│ │ ├── config/ # Configuration files
│ │ ├── controllers/ # Request handlers
│ │ ├── middleware/ # Custom middleware
│ │ ├── models/ # Mongoose models
│ │ ├── routes/ # API routes
│ │ ├── uploads/ # Uploaded files
│ │ └── utils/ # Utility functions
│ └── package.json
│
├── package.json # Root package.json
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone the repository
```bash
git clone https://github.com/yourusername/taskly.git
cd taskly
```

### Step 2: Install dependencies

* Install all dependencies (frontend + backend)
```bash
npm run install:all
```

* OR install separately:
```bash
npm install --prefix frontend
npm install --prefix backend
```
### Step 3: Set up environment variables
*  Backend (.env)
- Create a .env file in the backend folder:

**PORT=8000**
**MONGO_URI=MongoDB_Link**
**JWT_SECRET=your_super_secret_jwt_key_here**
**PORT=8000**
**NODE_ENV=development**

### 🏃 Running the Application
* **Development Mode (Both frontend and backend)**

```bash
npm run dev
```

* *This will start:*

- Frontend: http://localhost:5173

- Backend: http://localhost:8000


