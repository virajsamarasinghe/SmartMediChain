import React from 'react';
import ApprovalManagement from '../components/ApprovalManagement';
import { useAuth } from '../context/AuthContext';

const ApprovalsPage = () => {
  const { user } = useAuth();
  const isManager = user?.role && ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(user.role);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Management Approvals</h1>
      
      {!isManager && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6 flex items-start">
          <div className="text-blue-500 mr-3 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Approval Workflow Information</p>
            <p className="mt-1">
              Certain actions in the system require approval from designated managers before they can be completed. 
              You can view the status of your approval requests here.
            </p>
          </div>
        </div>
      )}
      
      {isManager && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6 flex items-start">
          <div className="text-green-500 mr-3 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Manager Approval Dashboard</p>
            <p className="mt-1">
              As a {user?.role?.replace('_', ' ')}, you have the authority to review and approve/reject requests
              that require your approval. Review each request carefully before making a decision.
            </p>
          </div>
        </div>
      )}
      
      <ApprovalManagement />
    </div>
  );
};

export default ApprovalsPage;
