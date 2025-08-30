import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { blockchainService } from '../services/blockchainService';
import Loading from './common/Loading';
import Card from './common/Card';

const BlockchainValidation = () => {
    const [searchParams] = useSearchParams();
    const [validationData, setValidationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [blockchainStatus, setBlockchainStatus] = useState(null);
    const [orderIdToValidate, setOrderIdToValidate] = useState('');
    const [validationHistory, setValidationHistory] = useState([]);

    useEffect(() => {
        checkBlockchainStatus();
        loadValidationHistory();
        
        // Check if order ID is provided in URL parameters
        const orderIdFromUrl = searchParams.get('orderId');
        if (orderIdFromUrl) {
            setOrderIdToValidate(orderIdFromUrl);
            // Auto-validate if order ID is provided
            setTimeout(() => {
                validateMedicineAuthenticity(orderIdFromUrl);
            }, 1000);
        }
    }, [searchParams]);

    const checkBlockchainStatus = async () => {
        try {
            const status = await blockchainService.getBlockchainStatus();
            setBlockchainStatus(status.data);
        } catch (error) {
            console.error('Failed to get blockchain status:', error);
            setBlockchainStatus({ isConnected: false, error: error.message });
        }
    };

    const loadValidationHistory = () => {
        const history = localStorage.getItem('validationHistory');
        if (history) {
            setValidationHistory(JSON.parse(history));
        }
    };

    const saveValidationToHistory = (validation) => {
        const history = [...validationHistory, validation];
        setValidationHistory(history);
        localStorage.setItem('validationHistory', JSON.stringify(history));
    };

    const validateMedicineAuthenticity = async (orderId = null) => {
        const idToValidate = orderId || orderIdToValidate;
        if (!idToValidate || typeof idToValidate !== 'string' || !idToValidate.trim()) {
            alert('Please enter an order ID to validate');
            return;
        }

        setLoading(true);
        try {
            const result = await blockchainService.getOrderFromBlockchain(idToValidate);
            
            if (result.success) {
                const validation = {
                    orderId: idToValidate,
                    timestamp: new Date().toISOString(),
                    status: 'AUTHENTIC',
                    data: result.data,
                    validatedAt: new Date().toLocaleString()
                };
                
                setValidationData(validation);
                saveValidationToHistory(validation);
            } else {
                const validation = {
                    orderId: idToValidate,
                    timestamp: new Date().toISOString(),
                    status: 'NOT_FOUND',
                    error: result.error || 'Order not found on blockchain',
                    validatedAt: new Date().toLocaleString()
                };
                
                setValidationData(validation);
                saveValidationToHistory(validation);
            }
        } catch (error) {
            console.error('Validation failed:', error);
            const validation = {
                orderId: idToValidate,
                timestamp: new Date().toISOString(),
                status: 'ERROR',
                error: error.message,
                validatedAt: new Date().toLocaleString()
            };
            
            setValidationData(validation);
            saveValidationToHistory(validation);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AUTHENTIC': return 'text-green-600 bg-green-100';
            case 'NOT_FOUND': return 'text-yellow-600 bg-yellow-100';
            case 'ERROR': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'AUTHENTIC': return '✅';
            case 'NOT_FOUND': return '⚠️';
            case 'ERROR': return '❌';
            default: return '❓';
        }
    };

    return (
        <div className="space-y-6">
            {/* Blockchain Status */}
            <Card>
                <h3 className="text-lg font-semibold mb-4">Blockchain Connection Status</h3>
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${blockchainStatus?.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${blockchainStatus?.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {blockchainStatus?.isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                    {blockchainStatus?.contractAddress && (
                        <span className="text-sm text-gray-500">
                            Contract: {blockchainService.formatTransactionHash(blockchainStatus.contractAddress)}
                        </span>
                    )}
                    {blockchainStatus?.currentBlock && (
                        <span className="text-sm text-gray-500">
                            Block: {blockchainStatus.currentBlock}
                        </span>
                    )}
                </div>
                {blockchainStatus?.error && (
                    <p className="text-red-600 text-sm mt-2">{blockchainStatus.error}</p>
                )}
            </Card>

            {/* Validation Form */}
            <Card>
                <h3 className="text-lg font-semibold mb-4">Validate Medicine Authenticity</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={orderIdToValidate}
                        onChange={(e) => setOrderIdToValidate(e.target.value)}
                        placeholder="Enter blockchain order ID"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading || !blockchainStatus?.isConnected}
                    />
                    <button
                        onClick={validateMedicineAuthenticity}
                        disabled={loading || !blockchainStatus?.isConnected || !orderIdToValidate.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loading size="small" /> : 'Validate'}
                    </button>
                </div>
                {!blockchainStatus?.isConnected && (
                    <p className="text-yellow-600 text-sm mt-2">
                        ⚠️ Blockchain service is not available. Please check the connection.
                    </p>
                )}
            </Card>

            {/* Validation Results */}
            {validationData && (
                <Card className="border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">{getStatusIcon(validationData.status)}</span>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(validationData.status)}`}>
                                    {validationData.status}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">
                                    Order ID: {validationData.orderId} | Validated: {validationData.validatedAt}
                                </p>
                            </div>
                        </div>

                        {validationData.status === 'AUTHENTIC' && validationData.data && (
                            <div className="bg-green-50 p-4 rounded-md">
                                <h4 className="font-medium text-green-800 mb-3">✅ Medicine Authenticity Confirmed</h4>
                                
                                {/* Order Details */}
                                {validationData.data.order && (
                                    <div className="mb-4">
                                        <h5 className="font-medium mb-2">Order Information:</h5>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Medicine:</span>
                                                <p className="font-medium">{validationData.data.order.medicineName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Quantity:</span>
                                                <p className="font-medium">{validationData.data.order.quantity} units</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Price per Unit:</span>
                                                <p className="font-medium">${validationData.data.order.pricePerUnit}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Total Price:</span>
                                                <p className="font-medium">${validationData.data.order.totalPrice}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Order Date:</span>
                                                <p className="font-medium">{new Date(validationData.data.order.timestamp).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Status:</span>
                                                <p className="font-medium">{validationData.data.order.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Fraud Detection Results */}
                                {validationData.data.fraudDetection && (
                                    <div className="mb-4">
                                        <h5 className="font-medium mb-2">AI Fraud Detection:</h5>
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className={`px-2 py-1 rounded text-sm ${
                                                validationData.data.fraudDetection.isFraud 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {validationData.data.fraudDetection.isFraud ? '🚩 Fraud Detected' : '✅ No Fraud'}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-sm ${
                                                validationData.data.fraudDetection.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                validationData.data.fraudDetection.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                Risk: {validationData.data.fraudDetection.riskLevel}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                Confidence: {validationData.data.fraudDetection.confidenceScore}%
                                            </span>
                                        </div>
                                        {validationData.data.fraudDetection.reasons && validationData.data.fraudDetection.reasons.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium mb-1">Detection Reasons:</p>
                                                <ul className="text-sm text-gray-700">
                                                    {validationData.data.fraudDetection.reasons.map((reason, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span>•</span>
                                                            <span>{reason}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Manager Approvals */}
                                {validationData.data.approvals && validationData.data.approvals.length > 0 && (
                                    <div>
                                        <h5 className="font-medium mb-2">Manager Approvals:</h5>
                                        <div className="space-y-2">
                                            {validationData.data.approvals.map((approval, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                                    <div>
                                                        <p className="font-medium">{approval.managerName}</p>
                                                        <p className="text-sm text-gray-600">{approval.role}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-1 rounded text-sm ${
                                                            approval.approved 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {approval.approved ? '✅ Approved' : '❌ Rejected'}
                                                        </span>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(approval.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {validationData.status === 'NOT_FOUND' && (
                            <div className="bg-yellow-50 p-4 rounded-md">
                                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Order Not Found</h4>
                                <p className="text-yellow-700">
                                    The order ID "{validationData.orderId}" was not found on the blockchain. 
                                    This could mean:
                                </p>
                                <ul className="list-disc ml-5 mt-2 text-yellow-700">
                                    <li>The order was not logged to the blockchain</li>
                                    <li>The order ID is incorrect</li>
                                    <li>The order is still being processed</li>
                                </ul>
                            </div>
                        )}

                        {validationData.status === 'ERROR' && (
                            <div className="bg-red-50 p-4 rounded-md">
                                <h4 className="font-medium text-red-800 mb-2">❌ Validation Error</h4>
                                <p className="text-red-700">{validationData.error}</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Validation History */}
            {validationHistory.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Recent Validations</h3>
                    <div className="space-y-3">
                        {validationHistory.slice(-5).reverse().map((validation, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{getStatusIcon(validation.status)}</span>
                                    <div>
                                        <p className="font-medium">Order ID: {validation.orderId}</p>
                                        <p className="text-sm text-gray-600">{validation.validatedAt}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(validation.status)}`}>
                                    {validation.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    {validationHistory.length > 5 && (
                        <p className="text-sm text-gray-500 mt-3">
                            Showing last 5 validations. Total: {validationHistory.length}
                        </p>
                    )}
                </Card>
            )}
        </div>
    );
};

export default BlockchainValidation;