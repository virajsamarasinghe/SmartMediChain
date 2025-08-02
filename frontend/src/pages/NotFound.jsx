import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <div className="mb-6">
                    <svg 
                        className="mx-auto h-24 w-24 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1} 
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                    </svg>
                </div>
                
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Sorry, the page you are looking for doesn't exist or has been moved.
                </p>
                
                <div className="space-y-4">
                    <Link to="/dashboard">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Link to="/medicine-management">
                        <Button className="w-full bg-gray-600 hover:bg-gray-700">
                            Manage Medicines
                        </Button>
                    </Link>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, please contact support.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
