import { createContext, useEffect, useState } from 'react';
import { medicineService } from '../services/medicineService';

export const MedicineContext = createContext();

export const MedicineProvider = ({ children }) => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load medicines from API
    const loadMedicines = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await medicineService.getMedicines();
            
            if (response.success && response.data.medicines) {
                // Transform API data to match frontend expectations
                const transformedMedicines = response.data.medicines.map(med => {
                    // Extract only the properties we need to avoid nested objects
                    return {
                        id: med._id,
                        name: med.name,
                        manufacturer: typeof med.manufacturer === 'object' ? med.manufacturer?.name || 'Unknown' : med.manufacturer || 'Unknown',
                        expiryDate: med.batchInfo?.expiryDate || '',
                        batchNumber: med.batchInfo?.batchNumber || '',
                        quantity: med.batchInfo?.quantity || 0,
                        currentStock: med.batchInfo?.quantity || 0,
                        minRequired: 20, // Default minimum
                        maxCapacity: 200, // Default maximum
                        category: typeof med.category === 'object' ? med.category.name : med.category,
                        pricing: typeof med.pricing === 'object' ? `${med.pricing.currency || '$'} ${med.pricing.amount || 0}` : med.pricing
                    };
                });
                setMedicines(transformedMedicines);
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
            setError(error.message || 'Failed to load medicines');
            
            // For debugging, we'll log the exact error details
            console.log('API Error Response:', error.response);
            console.log('JWT Token:', localStorage.getItem('token'));
            
            // Clear medicines array on error - no fallback to demo data
            setMedicines([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMedicines();
    }, []);

    // Add a new medicine
    const addMedicine = async (medicineData) => {
        try {
            setLoading(true);
            
            // Log what we're sending for debugging
            console.log("Sending medicine data:", JSON.stringify(medicineData, null, 2));
            
            const response = await medicineService.createMedicine(medicineData);
            
            if (response.success) {
                console.log("Successfully created medicine:", response);
                await loadMedicines(); // Reload all medicines
                return response;
            }
            throw new Error(response.message || 'Failed to add medicine');
        } catch (error) {
            console.error("Error adding medicine:", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update a medicine
    const updateMedicine = async (id, medicineData) => {
        try {
            setLoading(true);
            
            // Log what we're sending for debugging
            console.log("Updating medicine id:", id, "with data:", JSON.stringify(medicineData, null, 2));
            
            const response = await medicineService.updateMedicine(id, medicineData);
            
            if (response.success) {
                console.log("Successfully updated medicine:", response);
                await loadMedicines(); // Reload all medicines
                return response;
            }
            throw new Error(response.message || 'Failed to update medicine');
        } catch (error) {
            console.error("Error updating medicine:", error, "for ID:", id);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Delete a medicine
    const deleteMedicine = async (id) => {
        try {
            setLoading(true);
            
            // Validate the ID format - MongoDB ObjectIds are 24 hex chars
            if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                console.error(`Invalid ObjectId format: ${id}`);
                setError('Invalid medicine ID format');
                throw new Error('Invalid medicine ID format');
            }
            
            const response = await medicineService.deleteMedicine(id);
            
            // The response might be undefined or null if the server responds with 204 No Content
            if (response && response.success) {
                // Remove from local state immediately for better UX
                setMedicines(prevMedicines => prevMedicines.filter(med => med.id !== id));
                return response;
            } else if (response) {
                // The API returned something, but not success
                throw new Error(response.message || 'Failed to delete medicine');
            } else {
                // If we get here with no error but no response, it was probably a 204 success
                setMedicines(prevMedicines => prevMedicines.filter(med => med.id !== id));
                return { success: true, message: 'Medicine deleted successfully' };
            }
        } catch (error) {
            console.error('Error deleting medicine:', error);
            setError(error.message || 'An error occurred while deleting the medicine');
            throw error;
        } finally {
            setLoading(false);
        }
    };    // Get a medicine by ID
    const getMedicineById = (id) => {
        return medicines.find(med => med.id === id);
    };

    // Refresh medicines
    const refreshMedicines = () => {
        loadMedicines();
    };

    return (
        <MedicineContext.Provider value={{ 
            medicines, 
            loading, 
            error, 
            addMedicine,
            updateMedicine,
            deleteMedicine,
            getMedicineById,
            refreshMedicines
        }}>
            {children}
        </MedicineContext.Provider>
    );
};

// Add default export
export default MedicineProvider;