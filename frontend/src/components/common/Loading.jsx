import React from 'react';

const Loading = ({ size = 'default', text = 'Loading...', fullScreen = false }) => {
    const sizeClasses = {
        small: 'h-4 w-4',
        default: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    const LoadingSpinner = () => (
        <div className="flex items-center justify-center space-x-2">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
            {text && <span className="text-gray-600 animate-pulse">{text}</span>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="text-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 animate-pulse">{text}</p>
                </div>
            </div>
        );
    }

    return <LoadingSpinner />;
};

export default Loading;
