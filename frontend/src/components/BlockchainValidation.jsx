import { useEffect, useState } from 'react';
import { blockchainService } from '../services/blockchainService';
import Card from './common/Card';

const BlockchainValidation = () => {
    const [blockchainStatus, setBlockchainStatus] = useState(null);
    const [allBlockchainOrders, setAllBlockchainOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);


    useEffect(() => {
        checkBlockchainStatus();
        fetchAllBlockchainOrders();
    }, []);

    const fetchAllBlockchainOrders = async () => {
        try {
            setLoadingOrders(true);
            console.log('🔍 Fetching all blockchain orders...');
            const result = await blockchainService.getAllBlockchainOrders();
            console.log('📦 Result:', result);
            if (result.success && Array.isArray(result.orders)) {
                console.log('✅ Orders found:', result.orders.length);
                setAllBlockchainOrders(result.orders);
            } else {
                console.log('⚠️ No orders or invalid response');
                setAllBlockchainOrders([]);
            }
        } catch (error) {
            console.error('❌ Error fetching blockchain orders:', error);
            setAllBlockchainOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };



    const checkBlockchainStatus = async () => {
        try {
            const status = await blockchainService.getBlockchainStatus();
            setBlockchainStatus(status.data);
        } catch (error) {
            console.error('Failed to get blockchain status:', error);
            setBlockchainStatus({ isConnected: false, error: error.message });
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

            {/* All Blockchain Orders */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">All Blockchain Orders</h3>
                    <button
                        onClick={fetchAllBlockchainOrders}
                        disabled={loadingOrders}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                        {loadingOrders ? 'Refreshing...' : 'Refresh Orders'}
                    </button>
                </div>

                {allBlockchainOrders.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-2">No blockchain orders found.</p>
                        <p className="text-xs text-gray-400">Place a new order to see it appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-3 py-2 border">Order ID</th>
                                    <th className="px-3 py-2 border">Medicine</th>
                                    <th className="px-3 py-2 border">Quantity</th>
                                    <th className="px-3 py-2 border">Price/Unit</th>
                                    <th className="px-3 py-2 border">Total Price</th>
                                    <th className="px-3 py-2 border">Status</th>
                                    <th className="px-3 py-2 border">Order Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBlockchainOrders.map((entry, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-3 py-2 border font-mono text-xs">{entry.blockchainOrder?.orderId || 'N/A'}</td>
                                        <td className="px-3 py-2 border">{entry.blockchainOrder?.medicineName || 'N/A'}</td>
                                        <td className="px-3 py-2 border">{entry.blockchainOrder?.quantity || 'N/A'}</td>
                                        <td className="px-3 py-2 border">{entry.blockchainOrder?.pricePerUnit || 'N/A'}</td>
                                        <td className="px-3 py-2 border">{entry.blockchainOrder?.totalPrice || 'N/A'}</td>
                                        <td className="px-3 py-2 border">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${entry.blockchainOrder?.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    entry.blockchainOrder?.status === 'FRAUD_DETECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {entry.blockchainOrder?.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 border text-xs text-gray-500">{entry.blockchainOrder?.timestamp ? new Date(entry.blockchainOrder.timestamp).toLocaleString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>



        </div>
    );
};

export default BlockchainValidation;