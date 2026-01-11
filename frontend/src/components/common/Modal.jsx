import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    // Handle ESC key press to close the modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEsc);
        
        // Prevent scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    // Handle outside click to close the modal
    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby={title} role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay with blur effect */}
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-60 backdrop-blur-sm transition-opacity" 
                    aria-hidden="true"
                    onClick={handleOutsideClick}
                ></div>
                
                {/* Center modal */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div 
                    className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle border-2 border-blue-300 animate-fadeIn ${
                        size === 'lg' ? 'sm:max-w-4xl sm:w-full' : 
                        size === 'xl' ? 'sm:max-w-5xl sm:w-full' : 
                        size === 'sm' ? 'sm:max-w-lg sm:w-full' : 
                        'sm:max-w-xl sm:w-full'
                    }`}
                >
                    {/* Modal header */}
                    <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between border-b border-blue-100">
                        <h3 className="text-lg leading-6 font-medium text-blue-800">
                            {title}
                        </h3>
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Modal body */}
                    <div className="px-4 py-3 sm:p-6 max-h-[75vh] overflow-y-auto bg-white">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
