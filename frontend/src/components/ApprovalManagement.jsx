import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { approveRequest, cancelRequest, getAllApprovals, rejectRequest } from '../services/approvalService';

const ApprovalManagement = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const isManager = user?.role && ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(user.role);
  
  useEffect(() => {
    fetchApprovals();
  }, [filter]);
  
  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const filterObj = filter === 'all' ? {} : { status: filter };
      const response = await getAllApprovals(filterObj);
      setApprovals(response.data.approvals || []);
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
    
    if (!isManager) {
      toast.error('Only managers can approve requests');
      return;
    }
    
    try {
      await approveRequest(selectedApproval._id, comments);
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
    
    if (!isManager) {
      toast.error('Only managers can reject requests');
      return;
    }
    
    try {
      await rejectRequest(selectedApproval._id, comments);
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
      await cancelRequest(id);
      toast.success('Request cancelled successfully');
      fetchApprovals();
    } catch (error) {
      toast.error('Failed to cancel request');
      console.error(error);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md',
      approved: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md',
      rejected: 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-md',
      cancelled: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.cancelled}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
      high: 'bg-red-100 text-red-800 border-red-300',
      critical: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${priorityStyles[priority] || priorityStyles.medium}`}>
        {priority?.toUpperCase() || 'MEDIUM'}
      </span>
    );
  };

  const getRiskLevelIcon = (riskLevel) => {
    return riskLevel || 'N/A';
  };
  
  const canApprove = (approval) => {
    if (user.role === 'admin') return false;
    if (!isManager || approval.status !== 'pending') return false;
    return approval.requiredApprovals.some(item => 
      item.role === user.role && !item.isApproved
    );
  };
  
  const canCancel = (approval) => {
    if (user.role === 'admin') return false;
    if (!approval.requestedBy || !approval.requestedBy._id) return false;
    return user._id === approval.requestedBy._id && approval.status === 'pending';
  };
  
  const getApprovalProgress = (approval) => {
    const totalApprovals = approval.requiredApprovals.length;
    const completedApprovals = approval.requiredApprovals.filter(item => item.isApproved).length;
    const percentage = (completedApprovals / totalApprovals) * 100;
    return { completed: completedApprovals, total: totalApprovals, percentage };
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = searchTerm === '' || 
      approval.requestDetails?.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.requestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.requestDetails?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || approval.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getFilterCounts = () => {
    const counts = {
      all: approvals.length,
      pending: approvals.filter(a => a.status === 'pending').length,
      approved: approvals.filter(a => a.status === 'approved').length,
      rejected: approvals.filter(a => a.status === 'rejected').length
    };
    return counts;
  };

  const filterCounts = getFilterCounts();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Approval Management
          </h1>
          <p className="text-lg text-gray-600">
            {isManager ? `Welcome ${user?.role?.replace('_', ' ')} - Review and approve pending requests` : 'Track your approval requests'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{filterCounts.all}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{filterCounts.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{filterCounts.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{filterCounts.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === filterOption
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  <span className="ml-2 text-xs opacity-75">
                    ({filterOption === 'all' ? filterCounts.all : filterCounts[filterOption]})
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by medicine, requester, or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-80 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>      {/* Approval Cards */}
        <div className="space-y-6">
          {filteredApprovals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approvals Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No approvals match your search criteria.' : 'There are no approval requests at this time.'}
              </p>
            </div>
          ) : (
            filteredApprovals.map(approval => {
              const progress = getApprovalProgress(approval);
              const isUrgent = approval.requestDetails?.fraudDetected || approval.requestDetails?.aiRiskLevel === 'HIGH';
              
              return (
                <div key={approval._id} className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${
                  isUrgent ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
                }`}>
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {approval.requestDetails?.medicineName || approval.entityType} Request
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">
                              Order #{approval.requestDetails?.orderNumber}
                            </span>
                            {approval.requestDetails?.aiRiskLevel && (
                              <span className="text-xs font-medium">
                                {approval.requestDetails.aiRiskLevel} Risk
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(approval.status)}
                        {approval.requestDetails?.fraudDetected && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-md border border-red-300">
                            FRAUD DETECTED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-600 mb-1">Requested By</div>
                        <div className="text-sm text-gray-900 font-medium">{approval.requestedBy?.name}</div>
                        <div className="text-xs text-gray-500">{approval.requestedBy?.role?.replace('_', ' ')}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-600 mb-1">Request Details</div>
                        <div className="text-sm text-gray-900">
                          Qty: {approval.requestDetails?.quantity || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Value: ${approval.requestDetails?.totalValue || '0'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-600 mb-1">Created</div>
                        <div className="text-sm text-gray-900">
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(approval.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Approval Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Approval Progress ({progress.completed}/{progress.total})
                        </span>
                        <span className="text-sm text-gray-600">{Math.round(progress.percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {approval.requiredApprovals.map((item, index) => (
                          <div key={index} className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.isApproved 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : item.role === user.role && canApprove(approval)
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                          }`}>
                            {item.role.replace('_', ' ').toUpperCase()}
                            {item.isApproved && ' (APPROVED)'}
                            {item.role === user.role && !item.isApproved && canApprove(approval) && ' ← Your Turn'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleViewDetails(approval)}
                          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          View Details
                        </button>
                        
                        {canApprove(approval) && (
                          <button 
                            onClick={() => handleViewDetails(approval)}
                            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md"
                          >
                            Review & Approve
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {canCancel(approval) && (
                          <button 
                            onClick={() => handleCancel(approval._id)}
                            className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
                <div className="bg-white p-3 rounded border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedApproval.requestDetails?.medicineName && (
                      <div>
                        <span className="font-medium text-gray-600">Medicine:</span>
                        <div className="text-gray-900">{selectedApproval.requestDetails.medicineName}</div>
                      </div>
                    )}
                    {selectedApproval.requestDetails?.quantity && (
                      <div>
                        <span className="font-medium text-gray-600">Quantity:</span>
                        <div className="text-gray-900">{selectedApproval.requestDetails.quantity}</div>
                      </div>
                    )}
                    {selectedApproval.requestDetails?.totalValue && (
                      <div>
                        <span className="font-medium text-gray-600">Total Value:</span>
                        <div className="text-gray-900">${selectedApproval.requestDetails.totalValue}</div>
                      </div>
                    )}
                    {selectedApproval.requestDetails?.orderNumber && (
                      <div>
                        <span className="font-medium text-gray-600">Order Number:</span>
                        <div className="text-gray-900">{selectedApproval.requestDetails.orderNumber}</div>
                      </div>
                    )}
                    {selectedApproval.requestDetails?.aiRiskLevel && (
                      <div>
                        <span className="font-medium text-gray-600">AI Risk Level:</span>
                        <div className="text-gray-900">
                          {selectedApproval.requestDetails.aiRiskLevel}
                        </div>
                      </div>
                    )}
                    {selectedApproval.requestDetails?.fraudDetected && (
                      <div>
                        <span className="font-medium text-gray-600">Fraud Status:</span>
                        <div className="text-red-600">
                          Fraud Detected
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedApproval.requestDetails && Object.keys(selectedApproval.requestDetails).length === 0 && (
                    <div className="text-gray-500 italic">No additional details available</div>
                  )}
                </div>
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
                          <span className="text-green-600">
                            Approved
                            {item.approvedBy && <span className="text-xs ml-2">by {item.approvedBy.name}</span>}
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            Pending
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
    </div>
    );
  };

  export default ApprovalManagement;
