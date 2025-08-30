import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MedicineContext } from '../context/MedicineContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const Dashboard = () => {
    const { medicines } = useContext(MedicineContext);
    const { user } = useContext(AuthContext);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    
    // Check if user is an approval manager
    const isApprovalManager = user?.role && ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(user.role);
    
    // If the user is an approval manager, they should only see approval dashboard
    // They can access nothing else other than approvals and dashboard
    
    useEffect(() => {
        // Fetch pending approvals for managers
        if (isApprovalManager) {
            const fetchPendingApprovals = async () => {
                try {
                    const response = await axios.get(`${API_URL}/api/approvals?status=pending`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.data.success) {
                        setPendingApprovals(response.data.data.approvals);
                    }
                } catch (error) {
                    console.error('Error fetching pending approvals:', error);
                }
            };
            
            fetchPendingApprovals();
        }
    }, [isApprovalManager]);
    
    // Calculate some mock statistics for the dashboard
    const totalMedicines = medicines.length;
    const expiringMedicines = medicines.filter(med => {
        const expiryDate = new Date(med.expiryDate);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        return expiryDate <= sixMonthsFromNow;
    }).length;
    
    const lowStockMedicines = medicines.filter(med => med.quantity < 50).length;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                {isApprovalManager ? (
                    <p className="text-gray-600">Welcome back, {user?.name || 'Manager'}! You are logged in as a {user?.role?.replace('_', ' ')}.</p>
                ) : (
                    <p className="text-gray-600">Welcome back, {user?.name || 'User'}! Here's your medicine inventory overview.</p>
                )}
            </div>

            {/* Stats Overview - Show different stats for approval managers */}
            {isApprovalManager ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Pending Approvals</h2>
                        <div className="flex items-center">
                            <div className="text-3xl font-bold text-gray-800">{pendingApprovals.length}</div>
                        </div>
                    </div>
                
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Your Role</h2>
                        <div className="flex items-center">
                            <div className="text-xl font-bold text-gray-800">{user?.role?.replace(/_/g, ' ').toUpperCase()}</div>
                        </div>
                    </div>
                
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Recent Activity</h2>
                        <div className="flex items-center">
                            <div className="text-lg font-medium text-gray-800">Approval Management</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Medicines</h2>
                        <div className="flex items-center">
                            <div className="text-3xl font-bold text-gray-800">{totalMedicines}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Expiring Soon</h2>
                        <div className="flex items-center">
                            <div className="text-3xl font-bold text-gray-800">{expiringMedicines}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                        <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Low Stock</h2>
                        <div className="flex items-center">
                            <div className="text-3xl font-bold text-gray-800">{lowStockMedicines}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Medicines or Pending Approval Details */}
            {isApprovalManager ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Your Approval Responsibilities</h2>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="font-medium text-blue-700">As a {user?.role?.replace(/_/g, ' ')}, you have the authority to:</p>
                        <ul className="list-disc ml-5 mt-2">
                            <li className="mb-1">Review and approve order requests</li>
                            <li className="mb-1">Verify medicine authenticity</li>
                            <li className="mb-1">Confirm inventory changes</li>
                            <li className="mb-1">Validate user access requests</li>
                        </ul>
                    </div>
                    <div className="mt-4">
                        <Link to="/approvals" className="text-blue-600 hover:text-blue-800 font-medium">
                            Go to Approval Management →
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Recent Medicines</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-200">
                                    <th className="text-left p-3 font-semibold text-sm">Name</th>
                                    <th className="text-left p-3 font-semibold text-sm">Manufacturer</th>
                                    <th className="text-left p-3 font-semibold text-sm">Batch Number</th>
                                    <th className="text-left p-3 font-semibold text-sm">Expiry Date</th>
                                    <th className="text-left p-3 font-semibold text-sm">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.slice(0, 3).map(medicine => (
                                    <tr key={medicine.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3">{medicine.name}</td>
                                        <td className="p-3">{medicine.manufacturer}</td>
                                        <td className="p-3">{medicine.batchNumber}</td>
                                        <td className="p-3">{medicine.expiryDate}</td>
                                        <td className="p-3">{medicine.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <Link to="/medicine-management" className="text-blue-600 hover:text-blue-800 font-medium">
                            View all medicines →
                        </Link>
                    </div>
                </div>
            )}

            {/* Manager Approval Dashboard or Quick Actions */}
            {isApprovalManager ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
                    {pendingApprovals.length > 0 ? (
                        <div className="space-y-4">
                            {pendingApprovals.slice(0, 3).map(approval => (
                                <div key={approval._id} className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                                    <div className="flex justify-between">
                                        <h3 className="font-medium">{approval.requestType} {approval.entityType}</h3>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Requested by: {approval.requestedBy?.name || 'Unknown'}
                                    </p>
                                    <div className="mt-3">
                                        <Link to={`/approvals/${approval._id}`} className="text-blue-600 hover:underline text-sm">
                                            Review Request →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-4">
                                <Link to="/approvals" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                                    View All Approvals
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <p>No pending approvals require your attention.</p>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/medicine-management" className="p-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                            <div className="font-medium">Add New Medicine</div>
                            <p className="text-sm">Record a new medicine in the system</p>
                        </Link>
                        <Link to="/order-medicines" className="p-4 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition">
                            <div className="font-medium">Place Order</div>
                            <p className="text-sm">Order new medicines</p>
                        </Link>
                        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition">
                            <div className="font-medium">View Reports</div>
                            <p className="text-sm">Check inventory reports</p>
                        </div>
                        <Link to="/blockchain-validation" className="p-4 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition">
                            <div className="font-medium">Verify Blockchain</div>
                            <p className="text-sm">Validate medicine authenticity</p>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;