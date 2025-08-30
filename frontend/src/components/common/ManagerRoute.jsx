import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Component that protects routes accessible only by managers with approval authority
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if user is authorized
 * @returns {React.ReactNode} - Either the children or a redirect to dashboard
 */
const ManagerRoute = ({ children }) => {
  const { user } = useAuth();
  
  // Check if user has a manager role with approval authority
  const isManager = user?.role && [
    'operations_manager', 
    'compliance_manager', 
    'finance_manager', 
    'senior_manager'
  ].includes(user.role);
  
  if (!isManager) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default ManagerRoute;
