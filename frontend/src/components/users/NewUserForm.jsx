import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Loading from '../common/Loading';

const NewUserForm = ({ onClose, initialData, roles }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        password: '',
        role: 'patient',
        isActive: true,
        organization: {
            name: '',
            type: '',
            license: ''
        },
        profile: {
            phone: '',
            dateOfBirth: '',
            licenseNumber: '',
            specialization: ''
        }
    });
    
    const [errors, setErrors] = useState({});
    const [showOrgDetails, setShowOrgDetails] = useState(!!initialData?.organization?.name);
    const [showProfileDetails, setShowProfileDetails] = useState(!!initialData?.profile?.phone);

    // Organization types based on role
    const orgTypes = ['hospital', 'pharmacy', 'clinic', 'supplier', 'distributor', 'manufacturer'];

    // Handle input change for basic fields
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            // Handle nested objects (organization and profile)
            const [parent, child] = name.split('.');
            
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            // Handle top-level fields
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        
        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
        
        if (!initialData && !formData.password) newErrors.password = 'Password is required';
        else if (!initialData && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        
        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setLoading(true);
        
        try {
            // Clean up data before submitting
            const cleanData = { ...formData };
            
            if (!showOrgDetails) {
                delete cleanData.organization;
            }
            
            if (!showProfileDetails) {
                delete cleanData.profile;
            }
            
            if (initialData) {
                // For updates, don't send password if it's empty
                if (!cleanData.password) delete cleanData.password;
                
                // Wait for the update to complete
                await onClose(cleanData);
            } else {
                // For new user creation
                await onClose(cleanData);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            // Show error to user
            if (error.message) {
                alert(`Failed to save user: ${error.message}`);
            } else {
                alert('Failed to save user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative bg-white p-4 rounded-lg">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
                    <Loading text={initialData ? "Updating user..." : "Adding user..."} />
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <Input 
                        label="Full Name"
                        type="text" 
                        name="name"
                        placeholder="Enter full name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        error={errors.name}
                        className="border-2 border-gray-300 focus:border-blue-500"
                    />
                    <Input 
                        label="Email"
                        type="email" 
                        name="email"
                        placeholder="Enter email address" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        error={errors.email}
                        className="border-2 border-gray-300 focus:border-blue-500"
                    />
                    
                    {/* Only show password field for new users */}
                    {!initialData && (
                        <Input 
                            label="Password"
                            type="password" 
                            name="password"
                            placeholder="Enter password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required={!initialData}
                            error={errors.password}
                            className="border-2 border-gray-300 focus:border-blue-500"
                        />
                    )}
                    
                    {/* Role Selection */}
                    <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User Role
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Active Status */}
                    <div className="col-span-1 lg:col-span-1 flex items-center space-x-2 mt-6">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Active Account
                        </label>
                    </div>
                </div>
                
                {/* Organization Details Toggle */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Organization Details</h3>
                        <Button 
                            type="button" 
                            onClick={() => setShowOrgDetails(!showOrgDetails)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
                        >
                            {showOrgDetails ? 'Hide' : 'Show'}
                        </Button>
                    </div>
                    
                    {showOrgDetails && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                            <Input 
                                label="Organization Name"
                                type="text" 
                                name="organization.name"
                                placeholder="Enter organization name" 
                                value={formData.organization?.name || ''} 
                                onChange={handleChange} 
                                className="border-2 border-gray-300 focus:border-blue-500"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Organization Type
                                </label>
                                <select
                                    name="organization.type"
                                    value={formData.organization?.type || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                >
                                    <option value="">Select type</option>
                                    {orgTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input 
                                label="License Number"
                                type="text" 
                                name="organization.license"
                                placeholder="Enter license number" 
                                value={formData.organization?.license || ''} 
                                onChange={handleChange} 
                                className="border-2 border-gray-300 focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>
                
                {/* Profile Details Toggle */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Profile Details</h3>
                        <Button 
                            type="button" 
                            onClick={() => setShowProfileDetails(!showProfileDetails)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
                        >
                            {showProfileDetails ? 'Hide' : 'Show'}
                        </Button>
                    </div>
                    
                    {showProfileDetails && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                            <Input 
                                label="Phone Number"
                                type="tel" 
                                name="profile.phone"
                                placeholder="Enter phone number" 
                                value={formData.profile?.phone || ''} 
                                onChange={handleChange} 
                                className="border-2 border-gray-300 focus:border-blue-500"
                            />
                            <Input 
                                label="Date of Birth"
                                type="date" 
                                name="profile.dateOfBirth"
                                value={formData.profile?.dateOfBirth || ''} 
                                onChange={handleChange} 
                                className="border-2 border-gray-300 focus:border-blue-500"
                            />
                            <Input 
                                label="Professional License"
                                type="text" 
                                name="profile.licenseNumber"
                                placeholder="Enter professional license" 
                                value={formData.profile?.licenseNumber || ''} 
                                onChange={handleChange} 
                                className="border-2 border-gray-300 focus:border-blue-500"
                            />
                            <Input 
                                label="Specialization"
                                type="text" 
                                name="profile.specialization"
                                placeholder="Enter specialization" 
                                value={formData.profile?.specialization || ''} 
                                onChange={handleChange} 
                                className="border-2 border-gray-300 focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <Button 
                        type="button" 
                        onClick={() => onClose()}
                        className="bg-gray-500 hover:bg-gray-600 transition-all duration-300"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                        loading={loading}
                        loadingText={initialData ? "Updating..." : "Adding..."}
                        disabled={loading}
                    >
                        {initialData ? 'Update' : 'Add'} User
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NewUserForm;
