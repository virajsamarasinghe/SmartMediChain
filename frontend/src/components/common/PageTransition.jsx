import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loading from '../common/Loading';

const PageTransition = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showContent, setShowContent] = useState(true);
    const location = useLocation();
    const [prevLocation, setPrevLocation] = useState(location.pathname);

    useEffect(() => {
        if (location.pathname !== prevLocation) {
            setIsLoading(true);
            setShowContent(false);
            
            // Simulate page loading time
            const timer = setTimeout(() => {
                setIsLoading(false);
                setShowContent(true);
                setPrevLocation(location.pathname);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [location.pathname, prevLocation]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="large" text="Loading page..." />
            </div>
        );
    }

    return (
        <div className={`transition-all duration-500 ease-in-out ${
            showContent 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-4'
        }`}>
            {children}
        </div>
    );
};

export default PageTransition;
