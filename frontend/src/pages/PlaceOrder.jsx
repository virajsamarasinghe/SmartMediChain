import React, { useState, useEffect, useContext } from 'react';
import { MedicineContext } from '../context/MedicineContext';
import { AuthContext } from '../context/AuthContext';
import { blockchainService } from '../services/blockchainService';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import withPageAnimation from '../components/common/withPageAnimation';

const PlaceOrder = () => {
    const { medicines } = useContext(MedicineContext);
    const { user } = useContext(AuthContext);
    
    const [orders, setOrders] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedOrderToDelete, setSelectedOrderToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blockchainEnabled, setBlockchainEnabled] = useState(false);

    // Load orders from localStorage on component mount
    useEffect(() => {
        const loadData = async () => {
            setPageLoading(true);
            // Simulate loading time
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const savedOrders = localStorage.getItem('orders');
            if (savedOrders) {
                setOrders(JSON.parse(savedOrders));
            }
            
            // Check blockchain availability
            const isBlockchainAvailable = await blockchainService.isBlockchainAvailable();
            setBlockchainEnabled(isBlockchainAvailable);
            
            setPageLoading(false);
        };
        
        loadData();
    }, []);

    // AI Fraud Detection System
    const aiDetectFraud = (medicineData, orderQuantity, orderPrice) => {
        const fraudReasons = [];
        let riskLevel = 'LOW';
        
        // Check for overpricing (if price is 50% higher than normal)
        const normalPrice = 10; // Mock normal price per unit
        const pricePerUnit = orderPrice / orderQuantity;
        if (pricePerUnit > normalPrice * 1.5) {
            fraudReasons.push('Overpricing detected - Price is significantly higher than market rate');
            riskLevel = 'HIGH';
        }
        
        // Check for over-stock ordering (if quantity is more than double the available stock)
        if (orderQuantity > medicineData.quantity * 2) {
            fraudReasons.push('Over-stock ordering detected - Quantity exceeds reasonable limits');
            riskLevel = 'HIGH';
        }
        
        // Check for unusual quantity patterns
        if (orderQuantity > 1000) {
            fraudReasons.push('Unusual large quantity order detected');
            riskLevel = riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';
        }
        
        // Check for price anomalies
        if (pricePerUnit < normalPrice * 0.3) {
            fraudReasons.push('Suspiciously low pricing detected');
            riskLevel = riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';
        }

        return {
            isFraud: fraudReasons.length > 0,
            riskLevel,
            reasons: fraudReasons
        };
    };

    // Management Approval System
    const managementMembers = [
        { id: 1, name: 'John Smith', role: 'Senior Manager', approved: null },
        { id: 2, name: 'Sarah Johnson', role: 'Operations Manager', approved: null },
        { id: 3, name: 'Mike Chen', role: 'Finance Manager', approved: null },
        { id: 4, name: 'Lisa Williams', role: 'Compliance Manager', approved: null }
    ];

    const handlePlaceOrder = async () => {
        if (!selectedMedicine || !quantity || !price) {
            alert('Please fill in all fields');
            return;
        }

        const quantityNum = parseInt(quantity);
        const priceNum = parseFloat(price);

        if (quantityNum <= 0) {
            alert('Quantity must be greater than 0');
            return;
        }

        if (priceNum <= 0) {
            alert('Price must be greater than 0');
            return;
        }

        setLoading(true);
        setSubmitting(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const medicine = medicines.find(med => med.id === selectedMedicine);
            if (!medicine) {
                alert('Selected medicine not found');
                return;
            }

            // Check if quantity exceeds available stock
            if (quantityNum > medicine.quantity) {
                const proceed = window.confirm(`Warning: Requested quantity (${quantityNum}) exceeds available stock (${medicine.quantity}). Do you want to proceed anyway?`);
                if (!proceed) {
                    return;
                }
            }

            // Run AI fraud detection
            const aiResult = aiDetectFraud(medicine, quantityNum, priceNum);

            let blockchainData = null;
            
            // Try to place order on blockchain if available
            if (blockchainEnabled) {
                try {
                    const blockchainResult = await blockchainService.placeOrderWithFraudDetection({
                        medicineId: selectedMedicine,
                        medicineName: medicine.name,
                        quantity: quantityNum,
                        pricePerUnit: priceNum,
                        userId: user?.id || 'unknown'
                    });
                    
                    if (blockchainResult.success) {
                        blockchainData = {
                            blockchainOrderId: blockchainResult.data.blockchain?.blockchainOrderId,
                            transactionHashes: blockchainResult.data.blockchain?.transactionHashes,
                            blockchainLogged: true
                        };
                    }
                } catch (error) {
                    console.error('Blockchain logging failed:', error);
                    blockchainData = {
                        blockchainLogged: false,
                        error: error.message
                    };
                }
            }

            const newOrder = {
                id: Date.now().toString(),
                medicineId: selectedMedicine,
                medicineName: medicine.name,
                quantity: quantityNum,
                pricePerUnit: priceNum,
                totalPrice: quantityNum * priceNum,
                status: aiResult.isFraud ? 'FLAGGED_FOR_REVIEW' : 'PENDING_APPROVAL',
                aiDetection: aiResult,
                blockchain: blockchainData,
                managementApprovals: managementMembers.map(member => ({
                    ...member,
                    approved: null,
                    timestamp: null
                })),
                createdAt: new Date().toISOString(),
                createdBy: user?.name || 'Unknown User'
            };

            const updatedOrders = [...orders, newOrder];
            setOrders(updatedOrders);
            localStorage.setItem('orders', JSON.stringify(updatedOrders));

            // Reset form
            setSelectedMedicine('');
            setQuantity('');
            setPrice('');

            alert(`Order placed successfully! ${aiResult.isFraud ? 'AI detected potential fraud - Order flagged for review.' : 'Order sent for management approval.'}`);
        } catch (error) {
            alert('Failed to place order. Please try again.');
            console.error('Order placement error:', error);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const handleManagerApproval = async (orderId, managerId, approved) => {
        setSubmitting(true);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedOrders = orders.map(order => {
                if (order.id === orderId) {
                    const updatedApprovals = order.managementApprovals.map(manager => 
                        manager.id === managerId 
                            ? { ...manager, approved, timestamp: new Date().toISOString() }
                            : manager
                    );

                    // Check if we have enough approvals (at least 3 out of 4)
                    const approvedCount = updatedApprovals.filter(manager => manager.approved === true).length;
                    const rejectedCount = updatedApprovals.filter(manager => manager.approved === false).length;

                    let newStatus = order.status;
                    if (approvedCount >= 3) {
                        newStatus = 'APPROVED';
                    } else if (rejectedCount >= 2) {
                        newStatus = 'REJECTED';
                    }

                    return {
                        ...order,
                        managementApprovals: updatedApprovals,
                        status: newStatus
                    };
                }
                return order;
            });

            setOrders(updatedOrders);
            localStorage.setItem('orders', JSON.stringify(updatedOrders));
        } catch (error) {
            alert('Failed to update approval. Please try again.');
            console.error('Approval update error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-100';
            case 'REJECTED': return 'text-red-600 bg-red-100';
            case 'FLAGGED_FOR_REVIEW': return 'text-red-600 bg-red-100';
            case 'PENDING_APPROVAL': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getRiskLevelColor = (riskLevel) => {
        switch (riskLevel) {
            case 'HIGH': return 'text-red-600 bg-red-100';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
            case 'LOW': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    
    const handleDeleteOrder = async () => {
        if (!selectedOrderToDelete) return;
        
        setSubmitting(true);
        
        try {
            // For localStorage-based orders
            if (selectedOrderToDelete.id) {
                const updatedOrders = orders.filter(order => order.id !== selectedOrderToDelete.id);
                setOrders(updatedOrders);
                localStorage.setItem('orders', JSON.stringify(updatedOrders));
                toast.success('Order deleted successfully');
                setShowDeleteModal(false);
                setSelectedOrderToDelete(null);
            } 
            // For API-based orders
            else if (selectedOrderToDelete._id) {
                const response = await axios.delete(`${API_URL}/orders/${selectedOrderToDelete._id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.data.success) {
                    const updatedOrders = orders.filter(order => order._id !== selectedOrderToDelete._id);
                    setOrders(updatedOrders);
                    localStorage.setItem('orders', JSON.stringify(updatedOrders));
                    toast.success('Order deleted successfully');
                }
                
                setShowDeleteModal(false);
                setSelectedOrderToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error(
                error.response?.data?.message || 
                'Failed to delete order. Only administrators can delete orders.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 relative">
            {/* Page loading overlay */}
            {pageLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
                    <Loading size="large" text="Loading orders..." fullScreen />
                </div>
            )}
            
            {/* Submitting overlay */}
            {submitting && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <Loading size="default" text="Processing..." />
                    </div>
                </div>
            )}
            
            <div className={`transition-all duration-500 ${pageLoading ? 'opacity-0' : 'opacity-100'}`}>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 animate-fadeIn">Place Order with AI Fraud Detection</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${blockchainEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`text-sm font-medium ${blockchainEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                Blockchain {blockchainEnabled ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        {blockchainEnabled && (
                            <span className="text-sm text-gray-600">
                                Orders will be logged to blockchain for authenticity verification
                            </span>
                        )}
                    </div>
                </div>
            
            {/* Order Form */}
            <Card className="mb-8 hover-lift transition-smooth animate-scaleIn">
                <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Medicine
                        </label>
                        <select
                            value={selectedMedicine}
                            onChange={(e) => setSelectedMedicine(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a medicine...</option>
                            {medicines && medicines.length > 0 ? (
                                medicines.map(medicine => (
                                    <option key={medicine.id} value={medicine.id}>
                                        {medicine.name} (Stock: {medicine.quantity})
                                    </option>
                                ))
                            ) : (
                                <option disabled>No medicines available</option>
                            )}
                        </select>
                    </div>
                    
                    <Input
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                    />
                    
                    <Input
                        label="Price per Unit ($)"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter price per unit"
                    />
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        {quantity && price && (
                            <span>Total: ${(parseFloat(quantity || 0) * parseFloat(price || 0)).toFixed(2)}</span>
                        )}
                    </div>
                    <Button 
                        onClick={handlePlaceOrder} 
                        disabled={loading || !selectedMedicine || !quantity || !price}
                        loading={loading}
                        loadingText="Processing Order..."
                        className="px-6 py-2"
                    >
                        Place Order
                    </Button>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Delete Order</h3>
                        <p className="mb-6">
                            Are you sure you want to delete this order? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteOrder}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                disabled={submitting}
                            >
                                {submitting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Orders List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Order Status & Management Approval</h2>
                
                {orders.length === 0 ? (
                    <Card>
                        <p className="text-gray-500 text-center py-8">No orders placed yet.</p>
                    </Card>
                ) : (
                    orders.map((order, index) => (
                        <Card 
                            key={order.id} 
                            className={`border-l-4 border-blue-500 hover-lift transition-smooth animate-fadeIn`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <h3 className="text-lg font-semibold">{order.medicineName}</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <span className="text-sm text-gray-500">Quantity:</span>
                                            <p className="font-medium">{order.quantity} units</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Total Price:</span>
                                            <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Price per unit:</span>
                                            <p className="font-medium">${order.pricePerUnit.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* AI Detection Results */}
                                    <div className="mb-4">
                                        <h4 className="font-medium mb-2">AI Fraud Detection:</h4>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(order.aiDetection.riskLevel)}`}>
                                                Risk Level: {order.aiDetection.riskLevel}
                                            </span>
                                            {order.aiDetection.isFraud && (
                                                <span className="text-red-600 font-medium">🚩 FRAUD DETECTED</span>
                                            )}
                                        </div>
                                        {order.aiDetection.reasons.length > 0 && (
                                            <ul className="mt-2 text-sm text-red-600">
                                                {order.aiDetection.reasons.map((reason, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <span>•</span>
                                                        <span>{reason}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Blockchain Information */}
                                    {order.blockchain && (
                                        <div className="mb-4">
                                            <h4 className="font-medium mb-2">Blockchain Status:</h4>
                                            <div className="flex items-center gap-4">
                                                {order.blockchain.blockchainLogged ? (
                                                    <>
                                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                            ✅ Logged to Blockchain
                                                        </span>
                                                        {order.blockchain.blockchainOrderId && (
                                                            <span className="text-sm text-gray-600">
                                                                ID: {order.blockchain.blockchainOrderId}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                        ⚠️ Not Logged to Blockchain
                                                    </span>
                                                )}
                                            </div>
                                            {order.blockchain.transactionHashes && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <p>Transaction Hashes:</p>
                                                    <ul className="ml-4">
                                                        {order.blockchain.transactionHashes.orderTx && (
                                                            <li>Order: {blockchainService.formatTransactionHash(order.blockchain.transactionHashes.orderTx)}</li>
                                                        )}
                                                        {order.blockchain.transactionHashes.fraudDetectionTx && (
                                                            <li>Fraud Detection: {blockchainService.formatTransactionHash(order.blockchain.transactionHashes.fraudDetectionTx)}</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Management Approvals */}
                                    <div>
                                        <h4 className="font-medium mb-3">Management Approvals:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {order.managementApprovals.map(manager => (
                                                <div key={manager.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{manager.name}</p>
                                                        <p className="text-sm text-gray-500">{manager.role}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {manager.approved === null ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleManagerApproval(order.id, manager.id, true)}
                                                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                                                                    disabled={order.status === 'APPROVED' || order.status === 'REJECTED' || submitting}
                                                                >
                                                                    {submitting ? <Loading size="small" /> : 'Approve'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleManagerApproval(order.id, manager.id, false)}
                                                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                                                                    disabled={order.status === 'APPROVED' || order.status === 'REJECTED' || submitting}
                                                                >
                                                                    {submitting ? <Loading size="small" /> : 'Reject'}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className={`px-3 py-1 rounded text-sm font-medium ${
                                                                manager.approved 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {manager.approved ? '✓ Approved' : '✗ Rejected'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Approval Summary */}
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm">
                                                <span className="font-medium">Approval Status:</span> {' '}
                                                {order.managementApprovals.filter(m => m.approved === true).length} approved, {' '}
                                                {order.managementApprovals.filter(m => m.approved === false).length} rejected, {' '}
                                                {order.managementApprovals.filter(m => m.approved === null).length} pending
                                                {order.status === 'PENDING_APPROVAL' && ' (Need 3 approvals to proceed)'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                                <div className="flex justify-between items-center">
                                    <span>Order ID: {order.id}</span>
                                    <span>Created: {new Date(order.createdAt).toLocaleString()}</span>
                                    <div className="flex items-center gap-2">
                                        <span>By: {order.createdBy}</span>
                                        {order.blockchain?.blockchainOrderId && (
                                            <a 
                                                href={`/blockchain-validation?orderId=${order.blockchain.blockchainOrderId}`}
                                                className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                            >
                                                Verify on Blockchain
                                            </a>
                                        )}
                                        {user && user.role === 'admin' && (
                                            <button 
                                                onClick={() => {
                                                    setSelectedOrderToDelete(order);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="ml-4 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                            >
                                                Delete Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
        </div>
    );
};

export default withPageAnimation(PlaceOrder);
