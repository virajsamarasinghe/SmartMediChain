import React, { useState, useContext } from 'react';
import { MedicineContext } from '../../context/MedicineContext';
import Input from '../common/Input';
import Button from '../common/Button';
import Loading from '../common/Loading';

const MedicineForm = ({ onClose, initialData }) => {
    const { addMedicine, updateMedicine } = useContext(MedicineContext);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(initialData ? initialData.name : '');
    const [manufacturer, setManufacturer] = useState(initialData ? initialData.manufacturer : '');
    const [batchNumber, setBatchNumber] = useState(initialData ? initialData.batchNumber : '');
    const [expiryDate, setExpiryDate] = useState(initialData ? initialData.expiryDate : '');
    const [quantity, setQuantity] = useState(initialData ? initialData.quantity : '');
    const [currentStock, setCurrentStock] = useState(initialData ? initialData.currentStock : '');
    const [minRequired, setMinRequired] = useState(initialData ? initialData.minRequired : '');
    const [maxCapacity, setMaxCapacity] = useState(initialData ? initialData.maxCapacity : '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // For new entries, create data according to backend model structure
            let medicineData;
            
            if (initialData) {
                // For updates, we only need to send the updated fields
                medicineData = {
                    name,
                    manufacturer: typeof manufacturer === 'object' ? manufacturer : { name: manufacturer },
                    batchInfo: {
                        quantity: Number(quantity),
                        batchNumber: batchNumber,
                        expiryDate: expiryDate
                    }
                };
                
                // Pass ID separately to updateMedicine
                updateMedicine(initialData.id, medicineData);
            } else {
                // For new medicine, match the full schema
                medicineData = {
                    name,
                    category: 'Other', // Default value, can be expanded with a dropdown
                    manufacturer: { 
                        name: typeof manufacturer === 'object' ? manufacturer.name || 'Unknown' : manufacturer 
                    },
                    dosageForm: 'Tablet', // Default value, can be expanded with a dropdown
                    pricing: {
                        costPrice: Number(quantity) * 0.5, // Example calculation
                        sellingPrice: Number(quantity) * 1.0, // Example calculation
                        currency: 'USD'
                    },
                    batchInfo: {
                        batchNumber: batchNumber,
                        manufacturingDate: new Date().toISOString(), // Today's date
                        expiryDate: expiryDate,
                        quantity: Number(quantity)
                    }
                };
                
                addMedicine(medicineData);
            }
            
            resetForm();
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error('Error saving medicine:', error);
            
            // More descriptive error message
            if (error.message) {
                alert(`Failed to save medicine: ${error.message}`);
            } else {
                alert('Failed to save medicine. Please try again.');
            }
            
            // Keep form open with data on error
            setLoading(false);
            return;
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setManufacturer('');
        setBatchNumber('');
        setExpiryDate('');
        setQuantity('');
        setCurrentStock('');
        setMinRequired('');
        setMaxCapacity('');
    };

    return (
        <div className="relative bg-white p-4 rounded-lg">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
                    <Loading text={initialData ? "Updating medicine..." : "Adding medicine..."} />
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input 
                    label="Medicine Name"
                    type="text" 
                    placeholder="Enter medicine name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="border-2 border-gray-300 focus:border-blue-500"
                />
                <Input 
                    label="Manufacturer"
                    type="text" 
                    placeholder="Enter manufacturer name" 
                    value={manufacturer} 
                    onChange={(e) => setManufacturer(e.target.value)} 
                    required 
                    className="border-2 border-gray-300 focus:border-blue-500"
                />
                <Input 
                    label="Batch Number"
                    type="text" 
                    placeholder="Enter batch number" 
                    value={batchNumber} 
                    onChange={(e) => setBatchNumber(e.target.value)} 
                    required 
                    className="border-2 border-gray-300 focus:border-blue-500"
                />
                <Input 
                    label="Expiry Date"
                    type="date" 
                    value={expiryDate} 
                    onChange={(e) => setExpiryDate(e.target.value)} 
                    required 
                    className="border-2 border-gray-300 focus:border-blue-500"
                />
                <Input 
                    label="Quantity"
                    type="number" 
                    placeholder="Enter quantity" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    required 
                    className="border-2 border-gray-300 focus:border-blue-500"
                />
                <Input 
                    label="Current Stock"
                    type="number" 
                    placeholder="Enter current stock" 
                    value={currentStock} 
                    onChange={(e) => setCurrentStock(e.target.value)} 
                    required 
                    className="border-2 border-gray-300 focus:border-blue-500"
                />
                <Input 
                    label="Minimum Required"
                    type="number" 
                    placeholder="Enter minimum required quantity" 
                    value={minRequired} 
                    onChange={(e) => setMinRequired(e.target.value)} 
                    required 
                    className="border-2 border-gray-300 focus:border-blue-500"
                />
                <Input 
                    label="Maximum Capacity"
                    type="number" 
                    placeholder="Enter maximum capacity" 
                    value={maxCapacity} 
                    onChange={(e) => setMaxCapacity(e.target.value)} 
                    required 
                    className="border-2 border-gray-300 focus:border-blue-500"
                />
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                {onClose && (
                    <Button 
                        type="button" 
                        onClick={onClose}
                        className="bg-gray-500 hover:bg-gray-600 transition-all duration-300"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}
                <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                    loading={loading}
                    loadingText={initialData ? "Updating..." : "Adding..."}
                    disabled={loading}
                >
                    {initialData ? 'Update' : 'Add'} Medicine
                </Button>
            </div>
        </form>
        </div>
    );
};

export default MedicineForm;