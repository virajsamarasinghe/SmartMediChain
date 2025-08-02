import React, { useState } from 'react';
import Card from '../components/common/Card';

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        { 
            id: 1, 
            message: "Medicine stock low: Paracetamol", 
            time: "10 mins ago", 
            isRead: false,
            type: "warning"
        },
        { 
            id: 2, 
            message: "New shipment arrived: Amoxicillin", 
            time: "1 hour ago", 
            isRead: false,
            type: "info"
        },
        { 
            id: 3, 
            message: "Medicine expiring soon: Ibuprofen", 
            time: "2 days ago", 
            isRead: true,
            type: "alert"
        },
        { 
            id: 4, 
            message: "Order #12345 has been approved", 
            time: "3 days ago", 
            isRead: true,
            type: "success"
        },
        { 
            id: 5, 
            message: "AI detected potential fraud in order #12350", 
            time: "1 week ago", 
            isRead: false,
            type: "error"
        }
    ]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(notification => 
            notification.id === id ? { ...notification, isRead: true } : notification
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => 
            ({ ...notification, isRead: true })
        ));
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
            case 'info': return 'bg-blue-100 border-blue-400 text-blue-800';
            case 'alert': return 'bg-orange-100 border-orange-400 text-orange-800';
            case 'success': return 'bg-green-100 border-green-400 text-green-800';
            case 'error': return 'bg-red-100 border-red-400 text-red-800';
            default: return 'bg-gray-100 border-gray-400 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'warning':
                return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
            case 'info':
                return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
            case 'success':
                return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
            case 'error':
                return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
            default:
                return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="mt-2 text-gray-600">Stay updated with system alerts and important messages.</p>
                </div>
                <button 
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Mark All as Read
                </button>
            </div>

            <Card>
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p>No notifications available</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div 
                                key={notification.id}
                                className={`p-4 border-l-4 rounded-lg ${getTypeColor(notification.type)} ${
                                    notification.isRead ? 'opacity-60' : ''
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs mt-1 opacity-75">
                                            {notification.time}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="flex-shrink-0 text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-all"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Notifications;
