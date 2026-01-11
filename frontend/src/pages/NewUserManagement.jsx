import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import NewUserForm from '../components/users/NewUserForm';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import ResetPasswordModal from '../components/users/ResetPasswordModal';
import { toast } from '../services/toastService';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const NewUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [blurContent, setBlurContent] = useState(false);

    const roles = ['admin', 'supplier', 'distributor', 'retailer', 'hospital', 'patient'];

    useEffect(() => {
        loadUsers();
    }, [currentPage, roleFilter, activeFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const filters = {};
            if (roleFilter) filters.role = roleFilter;
            if (activeFilter) filters.isActive = activeFilter === 'active';
            
            const response = await userService.getAllUsers(currentPage, 10, filters);
            
            if (response.success) {
                setUsers(response.data.users);
                setTotalPages(response.data.pagination.pages);
            } else {
                setError('Failed to load users');
                toast.error('Failed to load users');
            }
        } catch (error) {
            setError('An error occurred while loading users');
            toast.error(error.message || 'An error occurred while loading users');
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsFormModalOpen(true);
        setBlurContent(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
        setBlurContent(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
        setBlurContent(true);
    };

    const handleResetPassword = (user) => {
        setSelectedUser(user);
        setIsResetPasswordModalOpen(true);
        setBlurContent(true);
    };

    const handleSubmitUser = async (userData) => {
        try {
            if (selectedUser) {

                const response = await userService.updateUser(selectedUser._id, userData);
                if (response.success) {
                    toast.success('User updated successfully');
                    loadUsers(); 
                } else {
                    toast.error(response.message || 'Failed to update user');
                }
            } else {
                // Create new user
                const response = await userService.createUser(userData);
                if (response.success) {
                    toast.success('User created successfully');
                    loadUsers();
                } else {
                    toast.error(response.message || 'Failed to create user');
                }
            }
            
            setIsFormModalOpen(false);
            setBlurContent(false);
            return true;
        } catch (error) {
            toast.error(error.message || 'An error occurred');
            console.error('Error submitting user:', error);
            return Promise.reject(error);
        }
    };

    // Delete user
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        
        try {
            const response = await userService.deleteUser(selectedUser._id);
            
            if (response.success) {
                toast.success('User deleted successfully');
                loadUsers(); // Reload users
                setIsDeleteModalOpen(false);
                setBlurContent(false);
            } else {
                toast.error(response.message || 'Failed to delete user');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting the user');
            console.error('Error deleting user:', error);
        }
    };

    // Reset user password
    const handlePasswordReset = async (password) => {
        if (!selectedUser) return;
        
        try {
            const response = await userService.setUserPassword(selectedUser._id, password);
            
            if (response.success) {
                toast.success('Password reset successfully');
                setIsResetPasswordModalOpen(false);
                setBlurContent(false);
            } else {
                toast.error(response.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while resetting the password');
            console.error('Error resetting password:', error);
        }
    };

    // Close any modal
    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsResetPasswordModalOpen(false);
        setBlurContent(false);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className={`${blurContent ? 'filter blur-sm' : ''}`}>
                <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage users, roles, and permissions</p>
                    </div>
                    <div className="mt-4 lg:mt-0">
                        <Button 
                            type="button"
                            onClick={handleAddUser}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Add New User
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                        <select 
                            value={roleFilter} 
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1); 
                            }}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                            <option value="">All Roles</option>
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                        <select 
                            value={activeFilter} 
                            onChange={(e) => {
                                setActiveFilter(e.target.value);
                                setCurrentPage(1); 
                            }}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    
                    <div className="flex items-end">
                        <Button 
                            type="button"
                            onClick={() => {
                                setRoleFilter('');
                                setActiveFilter('');
                                setCurrentPage(1);
                            }}
                            className="bg-gray-500 hover:bg-gray-600"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Organization
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-500">
                                            {error}
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.role === 'admin' 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : user.role === 'supplier'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : user.role === 'distributor'
                                                        ? 'bg-green-100 text-green-800'
                                                        : user.role === 'retailer'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : user.role === 'hospital'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.organization?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleResetPassword(user)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Reset Password
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                    currentPage === 1 
                                        ? 'text-gray-300 cursor-not-allowed' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                Previous
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        currentPage === i + 1
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                    currentPage === totalPages 
                                        ? 'text-gray-300 cursor-not-allowed' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* User Form Modal - This will be on top of the blur */}
            <div className="relative z-20">
                <Modal 
                    isOpen={isFormModalOpen} 
                    onClose={() => {
                        setIsFormModalOpen(false);
                        setBlurContent(false);
                    }}
                    title={selectedUser ? "Edit User" : "Add New User"}
                    size="lg"
                >
                    <NewUserForm 
                        initialData={selectedUser}
                        onClose={(data) => {
                            if (data) {
                                return handleSubmitUser(data);
                            } else {
                                setIsFormModalOpen(false);
                                setBlurContent(false);
                                return Promise.resolve();
                            }
                        }}
                        roles={roles}
                    />
                </Modal>
            </div>

            {/* Delete Confirmation Modal */}
            <div className="relative z-20">
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setBlurContent(false);
                    }}
                    onConfirm={handleDeleteUser}
                    title="Delete User"
                    message={`Are you sure you want to delete ${selectedUser?.name || 'this user'}? This action cannot be undone.`}
                />
            </div>

            {/* Reset Password Modal */}
            <div className="relative z-20">
                <ResetPasswordModal
                    isOpen={isResetPasswordModalOpen}
                    onClose={() => {
                        setIsResetPasswordModalOpen(false);
                        setBlurContent(false);
                    }}
                    onSubmit={handlePasswordReset}
                    title={`Reset Password for ${selectedUser?.name || 'User'}`}
                />
            </div>
        </div>
    );
};

export default NewUserManagement;
