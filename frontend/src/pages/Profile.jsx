import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || 'Test User',
        email: user?.email || 'test@example.com',
        phone: '+1 234-567-8900',
        role: 'Pharmacist',
        department: 'Pharmacy',
        joinDate: '2023-01-15'
    });

    const handleSave = () => {
        // Here you would typically save to backend
        console.log('Saving profile:', profileData);
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original data if needed
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="mt-2 text-gray-600">Manage your account settings and personal information.</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                        Edit Profile
                    </Button>
                )}
            </div>

            {/* Profile Information Card */}
            <Card>
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Full Name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    <Input
                        label="Phone Number"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    <Input
                        label="Role"
                        value={profileData.role}
                        onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    <Input
                        label="Department"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                    />
                    <Input
                        label="Join Date"
                        type="date"
                        value={profileData.joinDate}
                        onChange={(e) => setProfileData({...profileData, joinDate: e.target.value})}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                    />
                </div>

                {isEditing && (
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <Button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                            Save Changes
                        </Button>
                    </div>
                )}
            </Card>

            {/* Security Settings Card */}
            <Card>
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <div>
                            <h3 className="font-medium">Change Password</h3>
                            <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Change Password
                        </Button>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <div>
                            <h3 className="font-medium">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700">
                            Enable 2FA
                        </Button>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <div>
                            <h3 className="font-medium">Session Management</h3>
                            <p className="text-sm text-gray-600">Manage your active sessions and devices</p>
                        </div>
                        <Button className="bg-gray-600 hover:bg-gray-700">
                            View Sessions
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Profile;
