import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import MedicineForm from '../components/medicine/MedicineForm';
import MedicineList from '../components/medicine/MedicineList';
import Button from '../components/common/Button';
import withPageAnimation from '../components/common/withPageAnimation';

const MedicineManagement = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);

    const handleCloseForm = () => {
        setShowAddForm(false);
    };

    const handleOpenForm = () => {
        setShowAddForm(true);
    };

    const handleCloseOrderForm = () => {
        setShowOrderForm(false);
    };

    const handleOpenOrderForm = () => {
        setShowOrderForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center animate-fadeIn">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medicine Management</h1>
                    <p className="mt-2 text-gray-600">Manage your medicine inventory and track stock levels.</p>
                </div>
                <Button 
                    onClick={handleOpenForm} 
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                >
                    Add New Medicine
                </Button>
            </div>
            
            <div className="animate-slideIn">
                <h2 className="text-xl font-semibold mb-4">Medicine Inventory</h2>
                <MedicineList />
            </div>

            {/* Modal/Popup for Add Medicine Form */}
            {showAddForm && createPortal(
                <div 
                    className="fixed inset-0 z-[999999] overflow-y-auto"
                    onClick={handleCloseForm}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
                >
                    <div className="flex items-center justify-center min-h-screen px-4 py-12">
                        {/* Background overlay */}
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
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Add New Medicine
                                </h3>
                                <button
                                    onClick={handleCloseForm}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Modal body with scroll */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] bg-white">
                                <MedicineForm onClose={handleCloseForm} />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default withPageAnimation(MedicineManagement);
