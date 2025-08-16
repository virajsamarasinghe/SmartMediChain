import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    if (!user || user.role !== 'admin') {
        // If user is not admin, redirect to dashboard
        return <Navigate to="/dashboard" />;
    }
    
    return children;
};

export default AdminRoute;
