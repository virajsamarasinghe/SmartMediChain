import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState({ status: '', sortBy: 'createdAt', sortOrder: 'desc' });
    const { user } = useContext(AuthContext);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                sortBy: filter.sortBy,
                sortOrder: filter.sortOrder
            });

            if (filter.status) queryParams.append('status', filter.status);

            const response = await axios.get(`${API_URL}/orders?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                setOrders(response.data.data.orders);
                setTotalPages(response.data.data.pagination.totalPages);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(1);
    }, [filter]);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            fetchOrders(page);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteOrder = async () => {
        if (!selectedOrder) return;

        try {
            const response = await axios.delete(`${API_URL}/orders/${selectedOrder._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                toast.success('Order deleted successfully');
                setShowDeleteModal(false);
                setSelectedOrder(null);
                fetchOrders(currentPage);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error(
                error.response?.data?.message || 
                'Failed to delete order. Only administrators can delete orders.'
            );
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                <div className="flex gap-4">
                    <select
                        name="status"
                        value={filter.status}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        name="sortBy"
                        value={filter.sortBy}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="createdAt">Date Created</option>
                        <option value="updatedAt">Last Updated</option>
                        <option value="pricing.total">Price</option>
                    </select>
                    <select
                        name="sortOrder"
                        value={filter.sortOrder}
                        onChange={handleFilterChange}
                        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="py-3 px-4 text-left border-b">Order ID</th>
                                    <th className="py-3 px-4 text-left border-b">Date</th>
                                    <th className="py-3 px-4 text-left border-b">Customer</th>
                                    <th className="py-3 px-4 text-left border-b">Status</th>
                                    <th className="py-3 px-4 text-left border-b">Total</th>
                                    <th className="py-3 px-4 text-left border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border-b">{order._id}</td>
                                            <td className="py-3 px-4 border-b">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 border-b">
                                                {order.customer?.name || 'Unknown'}
                                            </td>
                                            <td className="py-3 px-4 border-b">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                                                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border-b">
                                                ${order.pricing?.total?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="py-3 px-4 border-b">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        className="text-blue-600 hover:text-blue-800"
                                                        onClick={() => window.location.href = `/order/${order._id}`}
                                                    >
                                                        View
                                                    </button>
                                                    
                                                    {user.role === 'admin' && (
                                                        <button 
                                                            className="text-red-600 hover:text-red-800"
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-4 px-4 text-center">
                                            No orders found with the selected filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <div>
                            Showing page {currentPage} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                        <p className="mb-6">
                            Are you sure you want to permanently delete this order? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteOrder}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
