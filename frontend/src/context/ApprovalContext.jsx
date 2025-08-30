import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAllApprovals } from '../services/approvalService';
import { useAuth } from './AuthContext';

export const ApprovalContext = createContext();

export const ApprovalProvider = ({ children }) => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Determine if user is a manager who can approve requests
  const isManager = user?.role && ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(user.role);
  
  useEffect(() => {
    if (!user) {
      setPendingApprovals([]);
      setUserRequests([]);
      setLoading(false);
      return;
    }
    
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        
        // Get approvals depending on user role
        if (isManager) {
          // For managers, get pending approvals they need to review
          const response = await getAllApprovals({
            status: 'pending',
            role: user.role
          });
          setPendingApprovals(response.data.approvals || []);
        }
        
        // Get user's own requests regardless of role
        const userResponse = await getAllApprovals({
          status: 'pending'
        });
        
        // Filter to only show user's own requests
        const ownRequests = userResponse.data.approvals?.filter(
          approval => approval.requestedBy._id === user._id
        ) || [];
        
        setUserRequests(ownRequests);
      } catch (error) {
        console.error('Failed to fetch approvals:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovals();
    
    // Refresh approvals every 5 minutes
    const interval = setInterval(fetchApprovals, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, isManager]);
  
  // Refresh approvals manually
  const refreshApprovals = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (isManager) {
        const response = await getAllApprovals({
          status: 'pending',
          role: user.role
        });
        setPendingApprovals(response.data.approvals || []);
      }
      
      const userResponse = await getAllApprovals({
        status: 'pending'
      });
      
      const ownRequests = userResponse.data.approvals?.filter(
        approval => approval.requestedBy._id === user._id
      ) || [];
      
      setUserRequests(ownRequests);
    } catch (error) {
      console.error('Failed to refresh approvals:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ApprovalContext.Provider 
      value={{ 
        pendingApprovals, 
        userRequests, 
        loading,
        refreshApprovals,
        pendingCount: pendingApprovals.length,
        userRequestsCount: userRequests.length,
        isManager
      }}
    >
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApproval = () => useContext(ApprovalContext);
