import React from 'react';
import Loading from './Loading';

const Button = ({ 
    onClick, 
    children, 
    type = 'button', 
    className = '', 
    disabled = false, 
    loading = false,
    loadingText = 'Loading...',
    ...props 
}) => {
    return (
        <button 
            type={type} 
            onClick={onClick} 
            disabled={disabled || loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transform hover:scale-105 active:scale-95 ${className} ${loading ? 'cursor-wait' : ''}`}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center space-x-2">
                    <Loading size="small" />
                    <span>{loadingText}</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;