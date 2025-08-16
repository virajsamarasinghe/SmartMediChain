import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { userService } from '../services/userService';
import UserForm from '../components/users/UserForm';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import ResetPasswordModal from '../components/users/ResetPasswordModal';
import { toast } from '../services/toastService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    // User roles for dropdown
    const roles = ['admin', 'supplier', 'distributor', 'retailer', 'hospital', 'patient'];

    // Fetch users when page, filters change
    useEffect(() => {
        loadUsers();
    }, [currentPage, roleFilter, activeFilter]);

    // Load users from API
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
            toast.error('An error occurred while loading users');
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle user creation
    const handleCreateUser = async (userData) => {
        try {
            setLoading(true);
            const response = await userService.createUser(userData);
            
            if (response.success) {
                toast.success('User created successfully');
                loadUsers();
                setIsCreateModalOpen(false);
            } else {
                toast.error(response.message || 'Failed to create user');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while creating the user');
            console.error('Error creating user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle user update
    const handleUpdateUser = async (userData) => {
        try {
            setLoading(true);
            const response = await userService.updateUser(selectedUser._id, userData);
            
            if (response.success) {
                toast.success('User updated successfully');
                loadUsers();
                setIsEditModalOpen(false);
            } else {
                toast.error(response.message || 'Failed to update user');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while updating the user');
            console.error('Error updating user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle user deletion
    const handleDeleteUser = async () => {
        try {
            setLoading(true);
            const response = await userService.deleteUser(selectedUser._id);
            
            if (response.success) {
                toast.success('User deleted successfully');
                loadUsers();
                setIsDeleteModalOpen(false);
            } else {
                toast.error(response.message || 'Failed to delete user');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting the user');
            console.error('Error deleting user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle password reset
    const handleResetPassword = async (password) => {
        try {
            setLoading(true);
            const response = await userService.resetUserPassword(selectedUser._id, password);
            
            if (response.success) {
                toast.success('Password reset successfully');
                setIsResetPasswordModalOpen(false);
            } else {
                toast.error(response.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while resetting the password');
            console.error('Error resetting password:', error);
        } finally {
            setLoading(false);
        }
    };

    // Render table row for each user
    const renderUserRow = (user) => (
        <tr key={user._id} className="hover:bg-gray-50 border-b transition-all">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                        ? 'bg-red-100 text-red-800'
                        : user.role === 'supplier' 
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'distributor'
                                ? 'bg-yellow-100 text-yellow-800'
                                : user.role === 'retailer'
                                    ? 'bg-purple-100 text-purple-800'
                                    : user.role === 'hospital'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2 justify-end">
                    <button
                        onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            setSelectedUser(user);
                            setIsResetPasswordModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                    >
                        Reset Password
                    </button>
                    <button
                        onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );

    // Render filter section
    const renderFilters = () => (
        <div className="flex flex-wrap items-center space-x-4 mb-4">
            <div>
                <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700">
                    Role
                </label>
                <select
                    id="roleFilter"
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="">All Roles</option>
                    {roles.map(role => (
                        <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            
            <div>
                <label htmlFor="activeFilter" className="block text-sm font-medium text-gray-700">
                    Status
                </label>
                <select
                    id="activeFilter"
                    value={activeFilter}
                    onChange={(e) => {
                        setActiveFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            
            <div className="mt-6">
                <button
                    onClick={() => {
                        setRoleFilter('');
                        setActiveFilter('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700"
                >
                    Clear Filters
                </button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6 animate-fadeIn">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
                    <p className="mt-2 text-gray-600">Manage system users and their roles.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedUser(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Create New User</span>
                </button>
            </div>
            
            {/* Filters */}
            {renderFilters()}
            
            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {/* User Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && currentPage === 1 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map(renderUserRow)
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div className="flex-1 flex justify-end">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage <= 1}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3 ${
                            currentPage <= 1 ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage >= totalPages}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                            currentPage >= totalPages ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
            
            {/* Create User Modal */}
            {isCreateModalOpen && createPortal(
                <div 
                    className="fixed inset-0 z-[999999] overflow-y-auto"
                    onClick={() => setIsCreateModalOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
                >
                    <div className="flex items-center justify-center min-h-screen px-4 py-12">
                        {/* Background overlay with blur */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998 }}
                        ></div>
                        
                        {/* Modal content */}
                        <div 
                            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden transform transition-all duration-300 scale-100"
                            onClick={(e) => e.stopPropagation()}
                            style={{ zIndex: 999999, position: 'relative' }}
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
                                <h3 className="text-lg font-semibold text-blue-800">
                                    Create New User
                                </h3>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Modal body with scroll */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] bg-white">
                                <UserForm
                                    isOpen={true}
                                    onClose={() => setIsCreateModalOpen(false)}
                                    onSubmit={handleCreateUser}
                                    title="Create New User"
                                    roles={roles}
                                    initialValues={{
                                        name: '',
                                        email: '',
                                        password: '',
                                        role: 'patient',
                                        isActive: true
                                    }}
                                    showPassword={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            
            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && createPortal(
                <div 
                    className="fixed inset-0 z-[999999] overflow-y-auto"
                    onClick={() => setIsEditModalOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
                >
                    <div className="flex items-center justify-center min-h-screen px-4 py-12">
                        {/* Background overlay with blur */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998 }}
                        ></div>
                        
                        {/* Modal content */}
                        <div 
                            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden transform transition-all duration-300 scale-100"
                            onClick={(e) => e.stopPropagation()}
                            style={{ zIndex: 999999, position: 'relative' }}
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
                                <h3 className="text-lg font-semibold text-blue-800">
                                    Edit User: {selectedUser.name}
                                </h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Modal body with scroll */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] bg-white">
                                <UserForm
                                    isOpen={true}
                                    onClose={() => setIsEditModalOpen(false)}
                                    onSubmit={handleUpdateUser}
                                    title="Edit User"
                                    roles={roles}
                                    initialValues={{
                                        name: selectedUser.name,
                                        email: selectedUser.email,
                                        role: selectedUser.role,
                                        isActive: selectedUser.isActive,
                                        organization: selectedUser.organization || {},
                                        profile: selectedUser.profile || {}
                                    }}
                                    showPassword={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            
            {/* Delete User Modal */}
            {isDeleteModalOpen && selectedUser && createPortal(
                <div 
                    className="fixed inset-0 z-[999999] overflow-y-auto"
                    onClick={() => setIsDeleteModalOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
                >
                    <div className="flex items-center justify-center min-h-screen px-4 py-12">
                        {/* Background overlay with blur */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998 }}
                        ></div>
                        
                        {/* Modal content */}
                        <div 
                            className="relative bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100"
                            onClick={(e) => e.stopPropagation()}
                            style={{ zIndex: 999999, position: 'relative' }}
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-gray-50">
                                <h3 className="text-lg font-semibold text-red-800">
                                    Delete User
                                </h3>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Modal body */}
                            <div className="p-6 bg-white">
                                <p className="text-gray-700">
                                    Are you sure you want to delete the user <span className="font-medium">{selectedUser.name}</span>? This action cannot be undone.
                                </p>
                                
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            
            {/* Reset Password Modal */}
            {isResetPasswordModalOpen && selectedUser && createPortal(
                <div 
                    className="fixed inset-0 z-[999999] overflow-y-auto"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
                >
                    <div className="flex items-center justify-center min-h-screen px-4 py-12">
                        {/* Background overlay with blur */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998 }}
                        ></div>
                        
                        {/* Modal content */}
                        <div 
                            className="relative bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100"
                            onClick={(e) => e.stopPropagation()}
                            style={{ zIndex: 999999, position: 'relative' }}
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-gray-50">
                                <h3 className="text-lg font-semibold text-yellow-800">
                                    Reset Password for {selectedUser.name}
                                </h3>
                                <button
                                    onClick={() => setIsResetPasswordModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Modal body */}
                            <div className="p-6 bg-white">
                                <ResetPasswordModal
                                    isOpen={true}
                                    onClose={() => setIsResetPasswordModalOpen(false)}
                                    onSubmit={handleResetPassword}
                                    title={`Reset Password for ${selectedUser.name}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default UserManagement;
