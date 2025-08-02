import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Settings = () => {
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            sms: false,
            lowStock: true,
            expiryAlerts: true,
            orderUpdates: true
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: '30',
            passwordExpiry: '90'
        },
        preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY'
        }
    });

    const handleNotificationChange = (key) => {
        setSettings({
            ...settings,
            notifications: {
                ...settings.notifications,
                [key]: !settings.notifications[key]
            }
        });
    };

    const handleSecurityChange = (key, value) => {
        setSettings({
            ...settings,
            security: {
                ...settings.security,
                [key]: value
            }
        });
    };

    const handlePreferenceChange = (key, value) => {
        setSettings({
            ...settings,
            preferences: {
                ...settings.preferences,
                [key]: value
            }
        });
    };

    const saveSettings = () => {
        // Here you would typically save to backend
        console.log('Saving settings:', settings);
        alert('Settings saved successfully!');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-2 text-gray-600">Manage your application preferences and security settings.</p>
            </div>

            {/* Notification Settings */}
            <Card title="Notification Preferences">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Delivery Methods</h3>
                            {[
                                { key: 'email', label: 'Email Notifications' },
                                { key: 'push', label: 'Push Notifications' },
                                { key: 'sms', label: 'SMS Notifications' }
                            ].map(({ key, label }) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{label}</span>
                                    <button
                                        onClick={() => handleNotificationChange(key)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            settings.notifications[key] ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                settings.notifications[key] ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Alert Types</h3>
                            {[
                                { key: 'lowStock', label: 'Low Stock Alerts' },
                                { key: 'expiryAlerts', label: 'Expiry Date Alerts' },
                                { key: 'orderUpdates', label: 'Order Status Updates' }
                            ].map(({ key, label }) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{label}</span>
                                    <button
                                        onClick={() => handleNotificationChange(key)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            settings.notifications[key] ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                settings.notifications[key] ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Security Settings */}
            <Card title="Security Settings">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button
                            onClick={() => handleSecurityChange('twoFactorAuth', !settings.security.twoFactorAuth)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Session Timeout (minutes)
                            </label>
                            <select
                                value={settings.security.sessionTimeout}
                                onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="120">2 hours</option>
                                <option value="480">8 hours</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password Expiry (days)
                            </label>
                            <select
                                value={settings.security.passwordExpiry}
                                onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="30">30 days</option>
                                <option value="60">60 days</option>
                                <option value="90">90 days</option>
                                <option value="180">180 days</option>
                                <option value="365">1 year</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Preference Settings */}
            <Card title="Application Preferences">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Theme
                        </label>
                        <select
                            value={settings.preferences.theme}
                            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language
                        </label>
                        <select
                            value={settings.preferences.language}
                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Timezone
                        </label>
                        <select
                            value={settings.preferences.timezone}
                            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Format
                        </label>
                        <select
                            value={settings.preferences.dateFormat}
                            onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
                    Save Settings
                </Button>
            </div>
        </div>
    );
};

export default Settings;
