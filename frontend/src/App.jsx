//todo ======================== TODOs ========================
//* import { Navigate } from "react-router-dom";
//* <Route path="/" element={<Navigate to="/login" replace />} />
//* 4. Ensure that any component with nested routes includes <Outlet />

//    so that child routes render correctly
import React from 'react'
import {
	BrowserRouter as Router, // Controlls the entire routing system. <Router> ... </Router>.
	Routes, // Container for all routes. <Routes> ... </Routes>.
	Route,// Define a single path - Component mapping.
	Navigate,
	Outlet,
} from 'react-router-dom';

import PrivateRoute from './routes/PrivateRoute';
import Home from './pages/Shared/Home';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import HrDashboard from './pages/Hr/HrDashboard';
import ManageUsers from './pages/Hr/ManageUsers';
import ManageTeams from './pages/Hr/ManageTeams';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import { UserContext } from './context/UserContext';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import UserProvider from './context/UserProvider';

// import HrRoutes from './routes/HrRoutes';
// import ManagerRoutes from './routes/ManagerRoutes';
// import EmployeeRoutes from './routes/EmployeeRoutes';

const App = () => {
	return (
		<>
			<UserProvider>
				<Router>
					{/* Route Can not be outside Routes. */}
					<Routes>
						{/* Global Routes */}
						<Route path='/login' element={<Login />} />
						<Route path='/forgot-password' element={<ForgotPassword />} />
						<Route path='/reset-password/:token' element={<ResetPassword />} />

						{/* Hr */}
						<Route element={<PrivateRoute allowedRoles={['hr']} />}>
							{/* <Route path='hr/*' element={ <HrRoutes /> } /> */}
							<Route path='/hr/dashboard' element={<HrDashboard />} />
							<Route path='/hr/users' element={<ManageUsers />} />
							<Route path='/hr/teams' element={<ManageTeams />} />
						</Route>

						{/* Manager */}
						<Route element={<PrivateRoute allowedRoles={['manager']} />} >
							<Route path='/manager/dashboard' element={<ManagerDashboard />} />
							{/* <Route path='manager/*' element={ <ManagerRoutes /> } /> */}
						</Route>

						{/* Employee */}
						<Route element={<PrivateRoute allowedRoles={['employee']} />}>
							<Route path='/employee/dashboard' element={<EmployeeDashboard />} />
							{/* <Route path='employee/*' element={ <EmployeeRoutes /> } /> */}
						</Route>
						{/* Default Route */}
						<Route path='/' element={<Root />} />
					</Routes>
				</Router>
			</UserProvider>

		</>
	)
}

export default App;

const Root = () => {
	const { user, loading } = React.useContext(UserContext);

	if (loading) return <div>Loading...</div>;
	console.log('Root user => ', user);
	if (!user) {
		return <Navigate to="/login" />;
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
}