import React from 'react';
import { Link } from 'react-router-dom';
import { useApproval } from '../../context/ApprovalContext';

const ApprovalNotification = () => {
  const { pendingApprovals, isManager } = useApproval();
  
  if (!isManager || pendingApprovals.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link to="/approvals">
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center transform transition-transform duration-300 hover:scale-105">
          <div className="mr-3">
            <span className="bg-white text-red-600 h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg">
              {pendingApprovals.length}
            </span>
          </div>
          <div>
            <p className="font-semibold">Pending Approvals</p>
            <p className="text-sm">Requiring your attention</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ApprovalNotification;
