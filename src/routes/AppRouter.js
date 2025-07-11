import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import EmailVerificationPage from '../pages/Auth/EmailVerificationPage';
import AboutPage from '../pages/About/AboutPage';
import FieldListPage from '../pages/FieldListPage';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Import page components
import HomePage from '../pages/Home/HomePage';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import UserManagementPage from '../pages/Admin/UserManagementPage';
import FieldApprovalPage from '../pages/Admin/FieldApprovalPage';
import OwnerDashboard from '../pages/Owner/OwnerDashboard';
import MyFieldsPage from '../pages/Owner/MyFieldsPage';
import FieldEditPage from '../pages/Owner/FieldEditPage';
import StaffManagementPage from '../pages/Owner/StaffManagementPage';
import StaffDashboard from '../pages/Staff/StaffDashboard';
import ManageBookingsPage from '../pages/Staff/ManageBookingsPage';
import ConfirmPaymentPage from '../pages/Staff/ConfirmPaymentPage';
import CustomerDashboard from '../pages/Customer/CustomerDashboard';
import MyBookingsPage from '../pages/Customer/MyBookingsPage';
import BookingConfirmationPage from '../pages/Customer/BookingConfirmationPage';
import FieldDetailsPage from '../pages/FieldDetailsPage';
import FieldDetailPage from '../pages/Customer/FieldDetailPage';
import StaffFieldListPage from '../pages/Staff/StaffFieldListPage';
import StaffFieldDetailPage from '../pages/Staff/StaffFieldDetailPage';
import UpdateSchedulePage from '../pages/Staff/UpdateSchedulePage';
import ProfilePage from '../pages/Customer/ProfilePage';
import OwnerProfilePage from '../pages/Owner/ProfilePage';
import StaffProfilePage from '../pages/Staff/ProfilePage';
import StaffBookingConfirmationPage from '../pages/Staff/BookingConfirmationPage';
import SubFieldsPage from '../pages/Owner/SubFieldsPage';

const AppRouter = () => {
    const { user } = useAuth();

    const getHomeRoute = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'ADMIN': return '/admin';
            case 'CHỦ SÂN': return '/owner';
            case 'NHÂN VIÊN': return '/staff';
            case 'KHÁCH HÀNG': return '/customer';
            default: return '/';
        }
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/fields" element={<FieldListPage />} />
            <Route path="/login" element={user ? <Navigate to={getHomeRoute()} /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to={getHomeRoute()} /> : <RegisterPage />} />
            <Route path="/email-verification" element={<EmailVerificationPage />} />
            <Route path="/field/:fieldId" element={<FieldDetailsPage />} />

            {/* Protected Routes */}
            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={['ADMIN']}><FieldApprovalPage /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['ADMIN']}><ProfilePage /></ProtectedRoute>} />

            {/* Owner */}
            <Route path="/owner" element={<ProtectedRoute allowedRoles={['CHỦ SÂN']}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/owner/fields" element={<ProtectedRoute allowedRoles={['CHỦ SÂN']}><MyFieldsPage /></ProtectedRoute>} />
            <Route path="/owner/field/:fieldId" element={<ProtectedRoute allowedRoles={['CHỦ SÂN']}><FieldEditPage /></ProtectedRoute>} />
            <Route path="/owner/fields/:fieldId/subfields" element={<SubFieldsPage />} />
            <Route path="/owner/staff" element={<ProtectedRoute allowedRoles={['CHỦ SÂN']}><StaffManagementPage /></ProtectedRoute>} />
            <Route path="/owner/profile" element={<ProtectedRoute allowedRoles={['CHỦ SÂN']}><OwnerProfilePage /></ProtectedRoute>} />

            {/* Staff */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['NHÂN VIÊN']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/fields" element={<ProtectedRoute allowedRoles={['NHÂN VIÊN']}><StaffFieldListPage /></ProtectedRoute>} />
            <Route path="/staff/fields/:fieldId" element={<ProtectedRoute allowedRoles={['NHÂN VIÊN']}><StaffFieldDetailPage /></ProtectedRoute>} />
            <Route path="/staff/update-schedule/:scheduleId" element={<ProtectedRoute allowedRoles={['NHÂN VIÊN']}><UpdateSchedulePage /></ProtectedRoute>} />
            <Route path="/staff/manage-bookings" element={<ProtectedRoute allowedRoles={['NHÂN VIÊN']}><ManageBookingsPage /></ProtectedRoute>} />
            <Route path="/staff/confirm-payment" element={<ProtectedRoute allowedRoles={['NHÂN VIÊN']}><ConfirmPaymentPage /></ProtectedRoute>} />
            <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['NHÂN VIÊN']}><StaffProfilePage /></ProtectedRoute>} />
            <Route path="/staff/booking-confirmation" element={<ProtectedRoute allowedRoles={['NHÂN VIÊN']}><StaffBookingConfirmationPage /></ProtectedRoute>} />

            {/* Customer */}
            <Route path="/customer" element={<ProtectedRoute allowedRoles={['KHÁCH HÀNG']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={['KHÁCH HÀNG']}><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/customer/booking-confirmation" element={<ProtectedRoute allowedRoles={['KHÁCH HÀNG']}><BookingConfirmationPage /></ProtectedRoute>} />
            <Route path="/customer/fields/:fieldId" element={<ProtectedRoute allowedRoles={['KHÁCH HÀNG']}><FieldDetailPage /></ProtectedRoute>} />
            <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['KHÁCH HÀNG']}><ProfilePage /></ProtectedRoute>} />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to={getHomeRoute()} />} />
        </Routes>
    );
};

export default AppRouter;
