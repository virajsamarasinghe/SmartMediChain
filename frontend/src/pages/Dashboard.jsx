import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MedicineContext } from '../context/MedicineContext';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { medicines } = useContext(MedicineContext);
    const { user } = useContext(AuthContext);
    
    // Calculate some mock statistics for the dashboard
    const totalMedicines = medicines.length;
    const expiringMedicines = medicines.filter(med => {
        const expiryDate = new Date(med.expiryDate);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        return expiryDate <= sixMonthsFromNow;
    }).length;
    
    const lowStockMedicines = medicines.filter(med => med.quantity < 50).length;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || 'User'}! Here's your medicine inventory overview.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Medicines</h2>
                    <div className="flex items-center">
                        <div className="text-3xl font-bold text-gray-800">{totalMedicines}</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Expiring Soon</h2>
                    <div className="flex items-center">
                        <div className="text-3xl font-bold text-gray-800">{expiringMedicines}</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                    <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Low Stock</h2>
                    <div className="flex items-center">
                        <div className="text-3xl font-bold text-gray-800">{lowStockMedicines}</div>
                    </div>
                </div>
            </div>

            {/* Recent Medicines */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Recent Medicines</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-200">
                                <th className="text-left p-3 font-semibold text-sm">Name</th>
                                <th className="text-left p-3 font-semibold text-sm">Manufacturer</th>
                                <th className="text-left p-3 font-semibold text-sm">Batch Number</th>
                                <th className="text-left p-3 font-semibold text-sm">Expiry Date</th>
                                <th className="text-left p-3 font-semibold text-sm">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.slice(0, 3).map(medicine => (
                                <tr key={medicine.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-3">{medicine.name}</td>
                                    <td className="p-3">{medicine.manufacturer}</td>
                                    <td className="p-3">{medicine.batchNumber}</td>
                                    <td className="p-3">{medicine.expiryDate}</td>
                                    <td className="p-3">{medicine.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4">
                    <Link to="/medicine-management" className="text-blue-600 hover:text-blue-800 font-medium">
                        View all medicines →
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/medicine-management" className="p-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                        <div className="font-medium">Add New Medicine</div>
                        <p className="text-sm">Record a new medicine in the system</p>
                    </Link>
                    <div className="p-4 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition">
                        <div className="font-medium">Update Inventory</div>
                        <p className="text-sm">Modify medicine quantities</p>
                    </div>
                    <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition">
                        <div className="font-medium">View Reports</div>
                        <p className="text-sm">Check inventory reports</p>
                    </div>
                    <div className="p-4 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition">
                        <div className="font-medium">Verify Blockchain</div>
                        <p className="text-sm">Validate medicine authenticity</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;