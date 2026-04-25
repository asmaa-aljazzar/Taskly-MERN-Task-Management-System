//todo ======================== TODOs ========================
//* import { Navigate } from "react-router-dom";
//* <Route path="/" element={<Navigate to="/login" replace />} />
//* 4. Ensure that any component with nested routes includes <Outlet />
//    so that child routes render correctly

import React from 'react'
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';

import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import UserProvider from './context/UserProvider';
import { UserContext } from './context/UserContext';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
// import Logout from './pages/Auth/Logout';

// HR Pages
import HrDashboard from './pages/Hr/HrDashboard';
// import ManageUsers from './pages/Hr/ManageUsers';
// import ManageTeams from './pages/Hr/ManageTeams';
// import CreateEmployee from './pages/Hr/CreateEmployee';
// import EditEmployee from './pages/Hr/EditEmployee';
// import CreateTeam from './pages/Hr/CreateTeam';
// import CreateTeam from './pages/Hr/EditTeam';
// import HrProjects from './pages/Hr/HrProjects';

// Manager Pages
import ManagerDashboard from './pages/Manager/ManagerDashboard';
// import ManagerTeams from './pages/Manager/ManagerTeams';
// import ManagerProjects from './pages/Manager/ManagerProjects';
// import TeamProjects from './pages/Manager/TeamProjects';
// import CreateProject from './pages/Manager/CreateProject';
// import EditProject from './pages/Manager/EditProject';
// import ProjectDetails from './pages/Manager/ProjectDetails';
// import ProjectTasks from './pages/Manager/ProjectTasks';
// import CreateTask from './pages/Manager/CreateTask';
// import EditTask from './pages/Manager/EditTask';
// import ManagerProfile from './pages/Manager/ManagerProfile';

// Employee Pages
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
// import EmployeeTasks from './pages/Employee/EmployeeTasks';
// import TaskDetails from './pages/Employee/TaskDetails';
// import EmployeeProfile from './pages/Employee/EmployeeProfile';

const Root = () => {
	const { user, loading } = React.useContext(UserContext);

	if (loading) return <div>Loading...</div>;

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// Redirect based on role
	if (user.role === 'hr') {
		return <Navigate to="/hr/dashboard" replace />;
	}
	if (user.role === 'manager') {
		return <Navigate to="/manager/dashboard" replace />;
	}
	if (user.role === 'employee') {
		return <Navigate to="/employee/dashboard" replace />;
	}

	// Fallback
	return <Navigate to="/login" replace />;
};

const App = () => {
	return (
		<>
			<UserProvider>
				<Toaster position="top-center" />
				<Router>
					<Routes>
						{/* ===== Public Routes ===== */}
						<Route element={<PublicRoute />}>
							<Route path='/login' element={<Login />} />
							<Route path='/forgot-password' element={<ForgotPassword />} />
							<Route path='/reset-password/:token' element={<ResetPassword />} />
						</Route>
						{/* <Route path='/logout' element={<Logout />} /> */}

						{/* ===== HR Routes ===== */}
						<Route element={<PrivateRoute allowedRoles={['hr']} />}>
							<Route path='/hr/dashboard' element={<HrDashboard />} />
							{/* <Route path='/hr/employees' element={<ManageUsers />} />
							<Route path='/hr/employees/create' element={<CreateEmployee />} />
							<Route path='/hr/employees/edit/:id' element={<EditEmployee />} />
							<Route path='/hr/teams' element={<ManageTeams />} />
							<Route path='/hr/teams/create' element={<CreateTeam />} />
							<Route path='/hr/projects' element={<HrProjects />} />
							<Route path='/hr/tasks' element={<HrTasks />} />
							*/}
						</Route>

						{/* ===== Manager Routes ===== */}
						<Route element={<PrivateRoute allowedRoles={['manager']} />}>
							<Route path='/manager/dashboard' element={<ManagerDashboard />} />
							{/* <Route path='/manager/teams' element={<ManagerTeams />} />
							<Route path='/manager/projects' element={<ManagerProjects />} />
							<Route path='/manager/teams/projects' element={<TeamProjects />} />
							<Route path='/manager/projects/create' element={<CreateProject />} />
							<Route path='/manager/projects/edit/:id' element={<EditProject />} />
							<Route path='/manager/projects/:projectId' element={<ProjectDetails />} />
							<Route path='/manager/projects/:projectId/tasks' element={<ProjectTasks />} />
							<Route path='/manager/projects/:projectId/tasks/create' element={<CreateTask />} />
							<Route path='/manager/projects/:projectId/tasks/edit/:taskId' element={<EditTask />} />
							<Route path='/manager/profile' element={<ManagerProfile />} /> */}
						</Route>

						{/* ===== Employee Routes ===== */}
						<Route element={<PrivateRoute allowedRoles={['employee']} />}>
							<Route path='/employee/dashboard' element={<EmployeeDashboard />} />
							{/* <Route path='/employee/tasks' element={<EmployeeTasks />} />
							<Route path='/employee/tasks/:taskId' element={<TaskDetails />} />
							<Route path='/employee/profile' element={<EmployeeProfile />} /> */}
						</Route>

						{/* ===== Root Route ===== */}
						<Route path='/' element={<Root />} />

						{/* ===== Catch All - 404 ===== */}
						<Route path='*' element={<Navigate to="/login" replace />} />
					</Routes>
				</Router>
			</UserProvider>
		</>
	);
};

export default App;
















// //todo ======================== TODOs ========================
// //* import { Navigate } from "react-router-dom";
// //* <Route path="/" element={<Navigate to="/login" replace />} />
// //* 4. Ensure that any component with nested routes includes <Outlet />

// //    so that child routes render correctly
// import React from 'react'
// import {
// 	BrowserRouter as Router, // Controlls the entire routing system. <Router> ... </Router>.
// 	Routes, // Container for all routes. <Routes> ... </Routes>.
// 	Route,// Define a single path - Component mapping.
// 	Navigate,
// 	Outlet,
// } from 'react-router-dom';

// import PrivateRoute from './routes/PrivateRoute';
// import Home from './pages/Shared/Home';
// import Login from './pages/Auth/Login';
// import ForgotPassword from './pages/Auth/ForgotPassword';
// import ResetPassword from './pages/Auth/ResetPassword';
// import HrDashboard from './pages/Hr/HrDashboard';
// import ManageUsers from './pages/Hr/ManageUsers';
// import ManageTeams from './pages/Hr/ManageTeams';
// import ManagerDashboard from './pages/Manager/ManagerDashboard';
// import { UserContext } from './context/UserContext';
// import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
// import UserProvider from './context/UserProvider';
// import { Toaster } from 'react-hot-toast';

// // import HrRoutes from './routes/HrRoutes';
// // import ManagerRoutes from './routes/ManagerRoutes';
// // import EmployeeRoutes from './routes/EmployeeRoutes';

// const App = () => {
// 	return (
// 		<>
// 		<Toaster position="top-center"/>
// 			<UserProvider>
// 				<Router>
// 					{/* Route Can not be outside Routes. */}
// 					<Routes>
// 						{/* Global Routes */}
// 						<Route path='/login' element={<Login />} />
// 						<Route path='/forgot-password' element={<ForgotPassword />} />
// 						<Route path='/reset-password/:token' element={<ResetPassword />} />

// 						{/* Hr */}
// 						<Route element={<PrivateRoute allowedRoles={['hr']} />}>
// 							{/* <Route path='hr/*' element={ <HrRoutes /> } /> */}
// 							<Route path='/hr/dashboard' element={<HrDashboard />} />
// 							<Route path='/hr/users' element={<ManageUsers />} />
// 							<Route path='/hr/teams' element={<ManageTeams />} />
// 						</Route>

// 						{/* Manager */}
// 						<Route element={<PrivateRoute allowedRoles={['manager']} />} >
// 							<Route path='/manager/dashboard' element={<ManagerDashboard />} />
// 							{/* <Route path='manager/*' element={ <ManagerRoutes /> } /> */}
// 						</Route>

// 						{/* Employee */}
// 						<Route element={<PrivateRoute allowedRoles={['employee']} />}>
// 							<Route path='/employee/dashboard' element={<EmployeeDashboard />} />
// 							{/* <Route path='employee/*' element={ <EmployeeRoutes /> } /> */}
// 						</Route>
// 						{/* Default Route */}
// 						<Route path='/' element={<Root />} />
// 					</Routes>
// 				</Router>
// 			</UserProvider>

// 		</>
// 	)
// }

// export default App;

// const Root = () => {
// 	const { user, loading } = React.useContext(UserContext);

// 	if (loading) return <div>Loading...</div>;
// 	console.log('Root user => ', user);
// 	if (!user) {
// 		return <Navigate to="/login" />;
// 	}

// 	// Redirect based on role
// 	if (user.role === 'hr') {
// 		return <Navigate to="/hr/dashboard" replace />;
// 	}
// 	if (user.role === 'manager') {
// 		return <Navigate to="/manager/dashboard" replace />;
// 	}
// 	if (user.role === 'employee') {
// 		return <Navigate to="/employee/dashboard" replace />;
// 	}

// 	// Fallback
// 	return <Navigate to="/login" replace />;
// }