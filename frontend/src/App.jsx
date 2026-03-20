//todo ======================== TODOs ========================
//* import { Navigate } from "react-router-dom";
//* <Route path="/" element={<Navigate to="/login" replace />} />

//* 4. Ensure that any component with nested routes includes <Outlet />
//    so that child routes render correctly
//todo ========================================================
import React from 'react'
import {BrowserRouter as Router, // Controlls the entire routing system. <Router> ... </Router>.
	Routes, // Container for all routes. <Routes> ... </Routes>.
	Route // Define a single path - Component mapping.
} from 'react-router-dom';

import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Auth/Login';
import ForgetPassword from './pages/Auth/ForgetPassword';
import ChangePassword from './pages/Auth/ChangePassword';
import HrRoutes from './routes/HrRoutes';
import ManagerRoutes from './routes/ManagerRoutes';
import EmployeeRoutes from './routes/EmployeeRoutes';

const App = () => {
	return (
		<>
			<Router>
				<Routes> // Route Can not be outside Routes.
					{/* Global Routes */}
					<Route path='/login' element={<Login />} />
					<Route path='/change-password' element={<ChangePassword />} />
					<Route path='/forget-password' element={<ForgetPassword />} />

					{/* Hr */}
					<Route element={<PrivateRoute allowedRoles={['hr']} />}>
						<Route path='hr/*' element={ <HrRoutes /> } />
					</Route>

					{/* Manager */}
					<Route element={<PrivateRoute allowedRoles={['manager']} />} >
						<Route path='manager/*' element={ <ManagerRoutes /> } />
					</Route>

					{/* Employee */}
					<Route element={<PrivateRoute allowedRoles={['employee']} />}>
						<Route path='employee/*' element={ <EmployeeRoutes /> } />
					</Route>
				</Routes>
			</Router>
		</>
	)
}

export default App;