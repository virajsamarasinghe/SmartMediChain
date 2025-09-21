import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Component that protects routes accessible only by non-manager roles
 * (admin, supplier, hospital, pharmacy_stock_manager, pharmacy_order_manager)
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if user is authorized
 * @returns {React.ReactNode} - Either the children or a redirect to dashboard
 */
const NonManagerRoute = ({ children }) => {
  const { user } = useAuth();
  
  // Check if user has a non-manager role
  const isNonManager = user?.role && [
    'admin', 
    'supplier', 
    'hospital',
    'pharmacy_stock_manager', 
    'pharmacy_order_manager'
  ].includes(user.role);
  
  if (!isNonManager) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default NonManagerRoute;