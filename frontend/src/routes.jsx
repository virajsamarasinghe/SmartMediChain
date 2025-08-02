import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MedicineManagement from './pages/MedicineManagement';
import PlaceOrder from './pages/PlaceOrder';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/medicine-management" element={<Layout><MedicineManagement /></Layout>} />
                <Route path="/order-medicines" element={<Layout><PlaceOrder /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;