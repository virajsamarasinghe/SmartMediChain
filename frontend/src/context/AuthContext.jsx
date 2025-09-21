import React, { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                console.log('🔄 Initializing authentication');
                const savedUser = authService.getCurrentUserData();
                
                if (savedUser && authService.isAuthenticated()) {
                    console.log('👤 Found existing user data, validating session');
                    // Validate session with backend
                    const isValid = await authService.validateSession();
                    if (isValid) {
                        console.log('✅ Session is valid');
                        setUser(savedUser);
                    } else {
                        console.log('❌ Session validation failed, clearing auth data');
                        await authService.logout();
                        setUser(null);
                    }
                } else {
                    console.log('❌ No valid auth data found');
                    await authService.logout();
                    setUser(null);
                }
            } catch (error) {
                console.error('❌ Auth initialization error:', error);
                await authService.logout();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            console.log('🔐 AuthContext: Starting login process for', email);
            
            const response = await authService.login(email, password);
            
            console.log('📥 AuthContext: Login response received', {
                success: response.success,
                hasUser: !!response.data?.user
            });
            
            if (response.success && response.data.user) {
                setUser(response.data.user);
                console.log('✅ AuthContext: User set successfully');
                return { success: true };
            } else {
                console.error('❌ AuthContext: Invalid response format', response);
                return { success: false, message: 'Invalid response format' };
            }
        } catch (error) {
            console.error('❌ AuthContext: Login error:', error);
            // Clear any existing auth data on login failure
            await authService.logout();
            setUser(null);
            
            return { 
                success: false, 
                message: error.message || 'Login failed. Please try again.' 
            };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            console.log('🚪 AuthContext: Starting logout process');
            await authService.logout();
            setUser(null);
            console.log('✅ AuthContext: Logout completed');
            return true;
        } catch (error) {
            console.error('❌ AuthContext: Logout error:', error);
            // Clear local data even if API call fails
            setUser(null);
            return true; // Always return true since local cleanup happened
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

// Add useAuth hook for easier context consumption
export const useAuth = () => React.useContext(AuthContext);