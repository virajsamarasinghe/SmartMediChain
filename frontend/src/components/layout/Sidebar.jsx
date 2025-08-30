import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ isOpen }) => {
    const { user, signOut } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Check if user has approval manager role
    const isApprovalManager = user?.role && ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(user.role);

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };
    
    return (
        <aside className={`${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} 
            fixed md:relative bg-gradient-to-b from-blue-800 to-blue-700 text-white h-full 
            overflow-hidden shadow-2xl transform transition-all duration-500 ease-in-out mt-0 pt-4 z-30
            ${isOpen ? 'md:w-64' : 'md:w-0'}`}>
            <div className={`p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'}`}>
                <h2 className="text-lg font-semibold mb-6 text-white">SmartMediChain</h2>
                <ul className="space-y-2">
                    <li>
                        <Link 
                            to="/dashboard" 
                            className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:transform hover:scale-105 ${
                                location.pathname === '/dashboard' 
                                    ? 'bg-blue-800 text-white shadow-lg border-l-4 border-blue-300' 
                                    : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>
                    </li>

                    {/* Show medicines management to all users */}
                    <li>
                        <Link 
                            to="/medicine-management" 
                            className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:transform hover:scale-105 ${
                                location.pathname === '/medicine-management'
                                    ? 'bg-blue-800 text-white shadow-lg border-l-4 border-blue-300' 
                                    : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Medicines
                        </Link>
                    </li>

                    {/* Only show order medicines if not an approval manager */}
                    {!isApprovalManager && (
                        <li>
                            <Link 
                                to="/order-medicines" 
                                className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:transform hover:scale-105 ${
                                    location.pathname === '/order-medicines'
                                        ? 'bg-blue-800 text-white shadow-lg border-l-4 border-blue-300' 
                                        : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Place Order
                            </Link>
                        </li>
                    )}

                    {/* Blockchain Validation - Show to all users */}
                    <li>
                        <Link 
                            to="/blockchain-validation" 
                            className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:transform hover:scale-105 ${
                                location.pathname === '/blockchain-validation'
                                    ? 'bg-blue-800 text-white shadow-lg border-l-4 border-blue-300' 
                                    : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Verify Blockchain
                        </Link>
                    </li>

                    {/* Only show User Management to admin */}
                    {user && user.role === 'admin' && (
                        <li>
                            <Link 
                                to="/user-management" 
                                className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:transform hover:scale-105 ${
                                    location.pathname === '/user-management'
                                        ? 'bg-blue-800 text-white shadow-lg border-l-4 border-blue-300' 
                                        : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                User Management
                            </Link>
                        </li>
                    )}
                    
                    {/* Approval Management - Only show for manager roles */}
                    {isApprovalManager && (
                        <li>
                            <Link 
                                to="/approvals" 
                                className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:transform hover:scale-105 ${
                                    location.pathname === '/approvals'
                                        ? 'bg-blue-800 text-white shadow-lg border-l-4 border-blue-300' 
                                        : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="flex items-center">
                                    Approvals
                                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                                        !
                                    </span>
                                </span>
                            </Link>
                        </li>
                    )}

                    {/* Profile link for all users */}
                    <li>
                        <Link 
                            to="/profile" 
                            className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:transform hover:scale-105 ${
                                location.pathname === '/profile' 
                                    ? 'bg-blue-800 text-white shadow-lg border-l-4 border-blue-300' 
                                    : 'text-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                        </Link>
                    </li>

                    {/* Logout button for all users */}
                    <li>
                        <button 
                            onClick={handleSignOut}
                            className="flex items-center w-full text-left py-3 px-4 text-blue-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;