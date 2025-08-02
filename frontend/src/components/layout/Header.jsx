import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const { signOut, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Refs for click outside detection
    const notificationsRef = useRef(null);
    const userMenuRef = useRef(null);
    const searchRef = useRef(null);
    
    // Mock notifications data
    const notifications = [
        { id: 1, message: "Medicine stock low: Paracetamol", time: "10 mins ago", isRead: false },
        { id: 2, message: "New shipment arrived: Amoxicillin", time: "1 hour ago", isRead: false },
        { id: 3, message: "Medicine expiring soon: Ibuprofen", time: "2 days ago", isRead: true },
    ];

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowUserMenu(false);
        setShowSearch(false);
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
        setShowNotifications(false);
        setShowSearch(false);
    };

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        setShowNotifications(false);
        setShowUserMenu(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
            // Implement search functionality here
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg sticky top-0 z-30">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                {/* Logo and Menu Button */}
                <div className="flex items-center">
                    <button 
                        onClick={toggleSidebar}
                        className="mr-4 focus:outline-none transition-all duration-300 hover:bg-blue-700 p-2 rounded-lg hover:scale-105"
                        aria-label="Toggle Sidebar"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-6 w-6 transition-transform duration-300 ${isSidebarOpen ? 'rotate-90' : 'rotate-0'}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h1 className="text-xl font-bold tracking-wide">SmartMediChain</h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="hidden lg:block">
                    <ul className="flex items-center space-x-6">
                        <li>
                            <Link 
                                to="/dashboard" 
                                className={`py-2 px-3 rounded transition-colors ${
                                    isActiveRoute('/dashboard') 
                                        ? 'bg-blue-800 text-white' 
                                        : 'hover:text-blue-200 hover:bg-blue-700'
                                }`}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/medicine-management" 
                                className={`py-2 px-3 rounded transition-colors ${
                                    isActiveRoute('/medicine-management') 
                                        ? 'bg-blue-800 text-white' 
                                        : 'hover:text-blue-200 hover:bg-blue-700'
                                }`}
                            >
                                Medicines
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/order-medicines" 
                                className={`py-2 px-3 rounded transition-colors ${
                                    isActiveRoute('/order-medicines') 
                                        ? 'bg-blue-800 text-white' 
                                        : 'hover:text-blue-200 hover:bg-blue-700'
                                }`}
                            >
                                Place Order
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Right side buttons */}
                <div className="flex items-center space-x-2">
                    {/* Search button */}
                    <div className="relative" ref={searchRef}>
                        <button 
                            className="p-2 rounded-full hover:bg-blue-700 focus:outline-none transition-all duration-300 hover:scale-105"
                            onClick={toggleSearch}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-5 w-5 transition-transform duration-300 ${showSearch ? 'rotate-90 scale-110' : 'rotate-0'}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        
                        {/* Search dropdown */}
                        <div className={`absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl py-2 text-gray-800 z-50 transition-all duration-300 transform origin-top-right ${
                            showSearch 
                                ? 'opacity-100 scale-100 translate-y-0' 
                                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}>
                            <form onSubmit={handleSearch} className="px-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search medicines, batches, or manufacturers..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                            <div className="px-4 py-2 text-sm text-gray-600">
                                <p>Quick search suggestions:</p>
                                <div className="mt-1 space-y-1">
                                    <button className="block w-full text-left hover:text-blue-600 transition-colors duration-200">Paracetamol</button>
                                    <button className="block w-full text-left hover:text-blue-600 transition-colors duration-200">Expired medicines</button>
                                    <button className="block w-full text-left hover:text-blue-600 transition-colors duration-200">Low stock items</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification bell */}
                    <div className="relative" ref={notificationsRef}>
                        <button 
                            className="p-2 rounded-full hover:bg-blue-700 focus:outline-none relative transition-all duration-300 hover:scale-105"
                            onClick={toggleNotifications}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-5 w-5 transition-all duration-300 ${showNotifications ? 'animate-pulse scale-110' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </button>
                        
                        {/* Notification dropdown */}
                        <div className={`absolute right-0 mt-2 w-72 bg-white rounded-md shadow-xl py-1 text-gray-800 z-50 transition-all duration-300 transform origin-top-right ${
                            showNotifications 
                                ? 'opacity-100 scale-100 translate-y-0' 
                                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}>
                            <div className="px-4 py-2 font-medium border-b border-gray-200 flex justify-between items-center">
                                <span>Notifications</span>
                                <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">Mark all as read</button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notification => (
                                        <div 
                                            key={notification.id} 
                                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${notification.isRead ? '' : 'bg-blue-50'}`}
                                        >
                                            <p className="text-sm font-medium">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                                )}
                            </div>
                            <div className="px-4 py-2 text-center border-t border-gray-200">
                                <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">View all notifications</Link>
                            </div>
                        </div>
                    </div>

                    {/* User profile dropdown */}
                    <div className="relative" ref={userMenuRef}>
                        <button 
                            onClick={toggleUserMenu}
                            className="flex items-center space-x-2 focus:outline-none hover:bg-blue-700 py-1 px-2 rounded-md transition-all duration-300 hover:scale-105"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-blue-700 font-medium transition-all duration-300">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="hidden md:block">{user?.name || 'User'}</span>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-4 w-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : 'rotate-0'}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {/* User dropdown menu */}
                        <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 text-gray-800 z-50 transition-all duration-300 transform origin-top-right ${
                            showUserMenu 
                                ? 'opacity-100 scale-100 translate-y-0' 
                                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}>
                            <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200">Profile</Link>
                            <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200">Settings</Link>
                            <div className="border-t border-gray-100"></div>
                            <button 
                                onClick={handleSignOut} 
                                className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 text-red-600 transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;