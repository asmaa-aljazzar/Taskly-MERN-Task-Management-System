import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

const PrivateRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(UserContext);

    if (loading) return <div>Loading...</div>;

    // Not logged in → go to login
    if (!user) return <Navigate to="/login" replace />;

    // Logged in but wrong role → go to their own dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'hr')       return <Navigate to="/hr/dashboard"       replace />;
        if (user.role === 'manager')  return <Navigate to="/manager/dashboard"  replace />;
        if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
    }

    // Authorized → render the page
    return <Outlet />;
}

export default PrivateRoute