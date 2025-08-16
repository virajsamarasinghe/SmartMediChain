import React, { useState } from 'react';

const UserForm = ({ onClose, onSubmit, roles, initialValues, showPassword }) => {
    const [formData, setFormData] = useState(initialValues || {
        name: '',
        email: '',
        password: '',
        role: 'patient',
        isActive: true,
        organization: {
            name: '',
            type: '',
            license: '',
            address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            }
        },
        profile: {
            phone: '',
            dateOfBirth: '',
            licenseNumber: '',
            specialization: ''
        }
    });

    const [errors, setErrors] = useState({});
    const [showOrgDetails, setShowOrgDetails] = useState(!!initialValues?.organization?.name);
    const [showProfileDetails, setShowProfileDetails] = useState(!!initialValues?.profile?.phone);

    // Organization types
    const orgTypes = ['hospital', 'pharmacy', 'clinic', 'supplier', 'distributor', 'manufacturer'];

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            // Handle nested objects (organization and profile)
            const [parent, child] = name.split('.');
            
            if (parent === 'organization' && child === 'address' && name.split('.').length === 3) {
                // Handle organization.address.field
                const [, , addressField] = name.split('.');
                setFormData(prev => ({
                    ...prev,
                    organization: {
                        ...prev.organization,
                        address: {
                            ...prev.organization?.address,
                            [addressField]: value
                        }
                    }
                }));
            } else {
                // Handle organization.field or profile.field
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            }
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
        
        if (showPassword && !formData.password) newErrors.password = 'Password is required';
        else if (showPassword && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        
        if (!formData.role) newErrors.role = 'Role is required';
        
        return newErrors;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Clean empty strings in nested objects
        const cleanFormData = { ...formData };
        
        // Clean organization if empty
        if (showOrgDetails) {
            // Remove empty address fields
            if (cleanFormData.organization?.address) {
                for (const key in cleanFormData.organization.address) {
                    if (cleanFormData.organization.address[key] === '') {
                        delete cleanFormData.organization.address[key];
                    }
                }
            }
        } else {
            delete cleanFormData.organization;
        }
        
        // Clean profile if empty
        if (showProfileDetails) {
            for (const key in cleanFormData.profile) {
                if (cleanFormData.profile[key] === '') {
                    delete cleanFormData.profile[key];
                }
            }
        } else {
            delete cleanFormData.profile;
        }
        
        onSubmit(cleanFormData);
    };

    return (
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    
                    {showPassword && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`mt-1 block w-full border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={`mt-1 block w-full border ${errors.role ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        >
                            {roles.map(role => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                        {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                            Active Account
                        </label>
                    </div>
                </div>
                
                {/* Organization Details Accordion */}
                <div className="border border-gray-200 rounded-md">
                    <button
                        type="button"
                        onClick={() => setShowOrgDetails(!showOrgDetails)}
                        className="flex justify-between items-center w-full px-4 py-2 text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <span className="font-medium">Organization Details</span>
                        <svg 
                            className={`w-5 h-5 transform ${showOrgDetails ? 'rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    {showOrgDetails && (
                        <div className="p-4 space-y-4">
                            <div>
                                <label htmlFor="organization.name" className="block text-sm font-medium text-gray-700">
                                    Organization Name
                                </label>
                                <input
                                    type="text"
                                    id="organization.name"
                                    name="organization.name"
                                    value={formData.organization?.name || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="organization.type" className="block text-sm font-medium text-gray-700">
                                    Organization Type
                                </label>
                                <select
                                    id="organization.type"
                                    name="organization.type"
                                    value={formData.organization?.type || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Type</option>
                                    {orgTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="organization.license" className="block text-sm font-medium text-gray-700">
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    id="organization.license"
                                    name="organization.license"
                                    value={formData.organization?.license || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="organization.address.street" className="block text-sm font-medium text-gray-700">
                                        Street
                                    </label>
                                    <input
                                        type="text"
                                        id="organization.address.street"
                                        name="organization.address.street"
                                        value={formData.organization?.address?.street || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="organization.address.city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="organization.address.city"
                                        name="organization.address.city"
                                        value={formData.organization?.address?.city || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="organization.address.state" className="block text-sm font-medium text-gray-700">
                                        State/Province
                                    </label>
                                    <input
                                        type="text"
                                        id="organization.address.state"
                                        name="organization.address.state"
                                        value={formData.organization?.address?.state || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="organization.address.zipCode" className="block text-sm font-medium text-gray-700">
                                        ZIP/Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        id="organization.address.zipCode"
                                        name="organization.address.zipCode"
                                        value={formData.organization?.address?.zipCode || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="organization.address.country" className="block text-sm font-medium text-gray-700">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        id="organization.address.country"
                                        name="organization.address.country"
                                        value={formData.organization?.address?.country || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Profile Details Accordion */}
                <div className="border border-gray-200 rounded-md">
                    <button
                        type="button"
                        onClick={() => setShowProfileDetails(!showProfileDetails)}
                        className="flex justify-between items-center w-full px-4 py-2 text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <span className="font-medium">Personal Details</span>
                        <svg 
                            className={`w-5 h-5 transform ${showProfileDetails ? 'rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    {showProfileDetails && (
                        <div className="p-4 space-y-4">
                            <div>
                                <label htmlFor="profile.phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    id="profile.phone"
                                    name="profile.phone"
                                    value={formData.profile?.phone || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="profile.dateOfBirth" className="block text-sm font-medium text-gray-700">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    id="profile.dateOfBirth"
                                    name="profile.dateOfBirth"
                                    value={formData.profile?.dateOfBirth ? new Date(formData.profile.dateOfBirth).toISOString().split('T')[0] : ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="profile.licenseNumber" className="block text-sm font-medium text-gray-700">
                                    Professional License Number
                                </label>
                                <input
                                    type="text"
                                    id="profile.licenseNumber"
                                    name="profile.licenseNumber"
                                    value={formData.profile?.licenseNumber || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="profile.specialization" className="block text-sm font-medium text-gray-700">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    id="profile.specialization"
                                    name="profile.specialization"
                                    value={formData.profile?.specialization || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {showPassword ? 'Create User' : 'Update User'}
                    </button>
                </div>
            </form>
    );
};

export default UserForm;
