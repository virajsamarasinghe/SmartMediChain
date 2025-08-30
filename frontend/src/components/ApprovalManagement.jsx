import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

const ApprovalManagement = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState('');
  
  const isManager = user?.role && ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(user.role);
  
  useEffect(() => {
    fetchApprovals();
  }, []);
  
  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/approvals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setApprovals(response.data.data.approvals);
    } catch (error) {
      toast.error('Failed to load approval requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setComments('');
  };
  
  const handleApprove = async () => {
    if (!selectedApproval) return;
    
    // Only managers can approve requests
    if (!isManager) {
      toast.error('Only managers can approve requests');
      return;
    }
    
    try {
      await axios.put(
        `${API_URL}/api/approvals/${selectedApproval._id}/approve`, 
        { comments },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast.success('Request approved successfully');
      setSelectedApproval(null);
      fetchApprovals();
    } catch (error) {
      toast.error('Failed to approve request');
      console.error(error);
    }
  };
  
  const handleReject = async () => {
    if (!selectedApproval || !comments) {
      toast.error('Comments are required when rejecting a request');
      return;
    }
    
    // Only managers can reject requests
    if (!isManager) {
      toast.error('Only managers can reject requests');
      return;
    }
    
    try {
      await axios.put(
        `${API_URL}/api/approvals/${selectedApproval._id}/reject`, 
        { comments },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast.success('Request rejected successfully');
      setSelectedApproval(null);
      fetchApprovals();
    } catch (error) {
      toast.error('Failed to reject request');
      console.error(error);
    }
  };
  
  const handleCancel = async (id) => {
    try {
      await axios.put(
        `${API_URL}/approvals/${id}/cancel`, 
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast.success('Request cancelled successfully');
      fetchApprovals();
    } catch (error) {
      toast.error('Failed to cancel request');
      console.error(error);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 flex items-center">⏱️ Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center">✅ Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center">❌ Rejected</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 flex items-center">🚫 Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  const canApprove = (approval) => {
    // Admin users can never approve requests, even if they somehow get access to this page
    if (user.role === 'admin') return false;
    
    // Only approval managers can approve, and only pending requests
    if (!isManager || approval.status !== 'pending') return false;
    
    // Additionally, the manager role must match one of the required approvals
    return approval.requiredApprovals.some(item => 
      item.role === user.role && !item.isApproved
    );
  };
  
  const canCancel = (approval) => {
    // Admin can never cancel approvals
    if (user.role === 'admin') return false;
    
    // Only the original requester can cancel pending requests
    return user._id === approval.requestedBy._id && approval.status === 'pending';
  };
  
  const getApprovalStatus = (approval) => {
    const totalApprovals = approval.requiredApprovals.length;
    const completedApprovals = approval.requiredApprovals.filter(item => item.isApproved).length;
    return `${completedApprovals}/${totalApprovals}`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Management Approvals</h2>
      
      {/* Approval List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approvals</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {approvals.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No approval requests found
                </td>
              </tr>
            ) : (
              approvals.map(approval => (
                <tr key={approval._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{approval.entityType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{approval.requestType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(approval.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{approval.requestedBy?.name}</div>
                    <div className="text-xs text-gray-500">{approval.requestedBy?.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getApprovalStatus(approval)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{new Date(approval.createdAt).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleViewDetails(approval)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View Details
                    </button>
                    {canApprove(approval) && (
                      <button 
                        onClick={() => handleViewDetails(approval)}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        Review
                      </button>
                    )}
                    {canCancel(approval) && (
                      <button 
                        onClick={() => handleCancel(approval._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Approval Details Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedApproval.entityType} {selectedApproval.requestType} Approval
              </h3>
            </div>
            
            <div className="p-4">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedApproval.status)}</div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Requested By:</span>
                  <div className="text-sm">
                    {selectedApproval.requestedBy?.name} ({selectedApproval.requestedBy?.role})
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Date:</span>
                  <div className="text-sm">
                    {new Date(selectedApproval.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                <h4 className="text-sm font-semibold mb-2">Request Details:</h4>
                <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border">
                  {JSON.stringify(selectedApproval.requestDetails, null, 2)}
                </pre>
              </div>
              
              <div className="border rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Required Approvals:</h4>
                <div className="space-y-2">
                  {selectedApproval.requiredApprovals.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.role.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div>
                        {item.isApproved ? (
                          <span className="text-green-600 flex items-center">
                            ✅ Approved
                            {item.approvedBy && <span className="text-xs ml-2">by {item.approvedBy.name}</span>}
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center">
                            ⏱️ Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {canApprove(selectedApproval) && (
                <div className="border rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Your Decision:</h4>
                  <div>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full h-24 p-2 border rounded resize-none"
                      placeholder="Add your comments here (required for rejection)"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedApproval(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
              
              {canApprove(selectedApproval) && (
                <>
                  <button 
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    disabled={!comments}
                  >
                    Reject
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalManagement;
