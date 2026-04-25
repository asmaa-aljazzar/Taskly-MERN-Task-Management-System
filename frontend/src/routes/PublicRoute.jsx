import { UserContext } from '../context/UserContext';
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // ✅ import Outlet

const PublicRoute = () => {
	const { user, loading } = useContext(UserContext);

	if (loading) return <div>Loading...</div>;

	if (user) {
		if (user.role === 'hr') return <Navigate to="/hr/dashboard" replace />;
		if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
		if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
	}

	return <Outlet />; // not children
};

export default PublicRoute;