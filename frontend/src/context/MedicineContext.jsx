import React, { createContext, useState, useEffect } from 'react';

export const MedicineContext = createContext();

export const MedicineProvider = ({ children }) => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Mock medicine data for frontend development
        const mockMedicines = [
            {
                id: '1',
                name: 'Paracetamol',
                manufacturer: 'ABC Pharma',
                expiryDate: '2026-12-31',
                batchNumber: 'BATCH001',
                quantity: 100,
                currentStock: 100,
                minRequired: 50,
                maxCapacity: 200
            },
            {
                id: '2',
                name: 'Amoxicillin',
                manufacturer: 'XYZ Pharmaceuticals',
                expiryDate: '2026-10-15',
                batchNumber: 'BATCH002',
                quantity: 50,
                currentStock: 50,
                minRequired: 30,
                maxCapacity: 150
            },
            {
                id: '3',
                name: 'Ibuprofen',
                manufacturer: 'Health Solutions',
                expiryDate: '2027-03-22',
                batchNumber: 'BATCH003',
                quantity: 75,
                currentStock: 75,
                minRequired: 40,
                maxCapacity: 180
            }
        ];
        
        // Check if we already have medicines in localStorage
        const savedMedicines = localStorage.getItem('medicines');
        if (savedMedicines) {
            setMedicines(JSON.parse(savedMedicines));
        } else {
            setMedicines(mockMedicines);
            localStorage.setItem('medicines', JSON.stringify(mockMedicines));
        }
        
        setLoading(false);
    }, []);

    // Add a new medicine
    const addMedicine = (medicine) => {
        const updatedMedicines = [...medicines, medicine];
        setMedicines(updatedMedicines);
        localStorage.setItem('medicines', JSON.stringify(updatedMedicines));
    };

    // Update a medicine
    const updateMedicine = (updatedMedicine) => {
        const updatedMedicines = medicines.map(med => 
            med.id === updatedMedicine.id ? updatedMedicine : med
        );
        setMedicines(updatedMedicines);
        localStorage.setItem('medicines', JSON.stringify(updatedMedicines));
    };

    // Delete a medicine
    const deleteMedicine = (id) => {
        const updatedMedicines = medicines.filter(med => med.id !== id);
        setMedicines(updatedMedicines);
        localStorage.setItem('medicines', JSON.stringify(updatedMedicines));
    };

    // Get a medicine by ID
    const getMedicineById = (id) => {
        return medicines.find(med => med.id === id);
    };

    return (
        <MedicineContext.Provider value={{ 
            medicines, 
            loading, 
            error, 
            addMedicine,
            updateMedicine,
            deleteMedicine,
            getMedicineById
        }}>
            {children}
        </MedicineContext.Provider>
    );
};

// Add default export
export default MedicineProvider;