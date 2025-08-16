import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if there's a user in localStorage (for persistence)
        const savedUser = authService.getUser();
        if (savedUser && authService.isAuthenticated()) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await authService.login(email, password);
            
            if (response.success && response.data.user) {
                setUser(response.data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            // Clear any existing auth data on login failure
            authService.logout();
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await authService.logout();
            setUser(null);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            // Clear local data even if API call fails
            setUser(null);
            return true;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// Add default export
export default AuthProvider;