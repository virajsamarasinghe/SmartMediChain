import React from 'react';
import BlockchainValidation from '../components/BlockchainValidation';
import withPageAnimation from '../components/common/withPageAnimation';

const BlockchainValidationPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Blockchain Medicine Validation</h1>
                <p className="text-gray-600">
                    Verify the authenticity of medicines using blockchain technology. 
                    Enter an order ID to validate its authenticity and view fraud detection results.
                </p>
            </div>
            
            <BlockchainValidation />
        </div>
    );
};

export default withPageAnimation(BlockchainValidationPage);