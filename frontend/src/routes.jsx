import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MedicineManagement from './pages/MedicineManagement';
import PlaceOrder from './pages/PlaceOrder';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import ApprovalsPage from './pages/ApprovalsPage';
import BlockchainValidationPage from './pages/BlockchainValidation';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import ManagerRoute from './components/common/ManagerRoute';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/medicine-management" element={
                    <ProtectedRoute>
                        <Layout><MedicineManagement /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/order-medicines" element={
                    <ProtectedRoute>
                        <Layout><PlaceOrder /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Layout><Profile /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                    <ProtectedRoute>
                        <Layout><Notifications /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <Layout><Settings /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/user-management" element={
                    <ProtectedRoute>
                        <AdminRoute>
                            <Layout><UserManagement /></Layout>
                        </AdminRoute>
                    </ProtectedRoute>
                } />
                <Route path="/approvals" element={
                    <ProtectedRoute>
                        <ManagerRoute>
                            <Layout><ApprovalsPage /></Layout>
                        </ManagerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/blockchain-validation" element={
                    <ProtectedRoute>
                        <Layout><BlockchainValidationPage /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;