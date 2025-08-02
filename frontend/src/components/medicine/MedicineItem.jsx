import React from 'react';

const MedicineItem = ({ medicine }) => {
    return (
        <div className="medicine-item">
            <h3>{medicine.name}</h3>
            <p>Dosage: {medicine.dosage}</p>
            <p>Quantity: {medicine.quantity}</p>
            <p>Expiry Date: {medicine.expiryDate}</p>
        </div>
    );
};

export default MedicineItem;