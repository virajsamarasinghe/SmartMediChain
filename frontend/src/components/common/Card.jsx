import React from 'react';

const Card = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            {title && <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>}
            <div>
                {children}
            </div>
        </div>
    );
};

export default Card;