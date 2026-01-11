import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminRoute from './components/common/AdminRoute';
import ManagerRoute from './components/common/ManagerRoute';
import NonManagerRoute from './components/common/NonManagerRoute';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import ApprovalsPage from './pages/ApprovalsPage';
import BlockchainValidationPage from './pages/BlockchainValidation';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MedicineManagement from './pages/MedicineManagement';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import PlaceOrder from './pages/PlaceOrder';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';

const AppRoutes = () => {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                        <NonManagerRoute>
                            <Layout><MedicineManagement /></Layout>
                        </NonManagerRoute>
                    </ProtectedRoute>
                } />
                <Route path="/order-medicines" element={
                    <ProtectedRoute>
                        <NonManagerRoute>
                            <Layout><PlaceOrder /></Layout>
                        </NonManagerRoute>
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
                        <NonManagerRoute>
                            <Layout><BlockchainValidationPage /></Layout>
                        </NonManagerRoute>
                    </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;