import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import PageTransition from '../common/PageTransition';
import Loading from '../common/Loading';

const Layout = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/' || location.pathname === '/login';
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPageLoading, setIsPageLoading] = useState(false);
    
    // Check if we're on mobile and close sidebar on mobile by default
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        }
        
        // Set initial state
        handleResize();
        
        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Clean up
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle page loading on route change
    useEffect(() => {
        setIsPageLoading(true);
        const timer = setTimeout(() => {
            setIsPageLoading(false);
        }, 200);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex flex-col min-h-screen relative">
            {/* Semi-transparent overlay that appears when sidebar is open on mobile */}
            <div 
                className={`md:hidden fixed inset-0 bg-black z-20 transition-all duration-500 ${
                    sidebarOpen 
                        ? 'bg-opacity-50 pointer-events-auto' 
                        : 'bg-opacity-0 pointer-events-none'
                }`}
                onClick={toggleSidebar}
            ></div>
            
            {!isLoginPage && <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />}
            <div className="flex flex-1 relative pt-0">
                {!isLoginPage && <Sidebar isOpen={sidebarOpen} />}
                <main className={`flex-1 transition-all duration-500 ease-in-out ${
                    !isLoginPage ? 'bg-gray-50' : 'bg-white'
                } ${
                    !isLoginPage && sidebarOpen ? 'md:ml-0' : 'md:ml-0'
                } relative overflow-hidden`}>
                    {/* Page loading overlay */}
                    {isPageLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 backdrop-blur-sm">
                            <Loading size="large" text="Loading..." />
                        </div>
                    )}
                    
                    {/* Page content with transitions */}
                    <div className={`transition-all duration-500 ease-in-out p-6 ${
                        isPageLoading 
                            ? 'opacity-50 transform scale-95' 
                            : 'opacity-100 transform scale-100'
                    }`}>
                        {isLoginPage ? (
                            children
                        ) : (
                            <PageTransition>
                                {children}
                            </PageTransition>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;