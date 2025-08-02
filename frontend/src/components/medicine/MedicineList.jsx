import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { MedicineContext } from '../../context/MedicineContext';
import MedicineForm from './MedicineForm';

const MedicineList = () => {
    const { medicines, deleteMedicine, getMedicineById } = useContext(MedicineContext);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            deleteMedicine(id);
        }
    };

    const handleEdit = (id) => {
        const medicine = getMedicineById(id);
        setEditingMedicine(medicine);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingMedicine(null);
    };

    const getStockStatus = (currentStock, minRequired, maxCapacity) => {
        if (currentStock <= minRequired) {
            return { color: 'bg-red-100 text-red-800', status: 'Low Stock' };
        } else if (currentStock >= maxCapacity * 0.9) {
            return { color: 'bg-yellow-100 text-yellow-800', status: 'Near Full' };
        } else {
            return { color: 'bg-green-100 text-green-800', status: 'Normal' };
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Manufacturer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Batch Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Min Required
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Max Capacity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expiry Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {medicines.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                                        No medicines available
                                    </td>
                                </tr>
                            ) : (
                                medicines.map((medicine) => {
                                    const stockStatus = getStockStatus(
                                        medicine.currentStock || medicine.quantity,
                                        medicine.minRequired || 0,
                                        medicine.maxCapacity || 100
                                    );
                                    
                                    return (
                                        <tr key={medicine.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {medicine.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {medicine.manufacturer}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {medicine.batchNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {medicine.quantity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                                    {medicine.currentStock || medicine.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {medicine.minRequired || 'Not set'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {medicine.maxCapacity || 'Not set'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                                    {stockStatus.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(medicine.expiryDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(medicine.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors duration-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(medicine.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Medicine Modal */}
            {showEditModal && editingMedicine && createPortal(
                <div 
                    className="fixed inset-0 z-[999999] overflow-y-auto"
                    onClick={handleCloseEditModal}
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
                                    Edit Medicine
                                </h3>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Modal body with scroll */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] bg-white">
                                <MedicineForm 
                                    onClose={handleCloseEditModal} 
                                    initialData={editingMedicine}
                                />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default MedicineList;