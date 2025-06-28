import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/MainLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    const userHasRequiredRole = user && allowedRoles.includes(user.role);

    if (!userHasRequiredRole) {
        // Logged in but does not have the required role, redirect to home or an unauthorized page
        return <Navigate to="/" replace />;
    }

    // User is authenticated and has the required role, render the component with the layout
    return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;
