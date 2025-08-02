import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // For frontend only - mocked authentication
    useEffect(() => {
        // Check if there's a user in localStorage (for persistence)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock successful login for frontend testing
        const mockUser = {
            id: '1',
            email,
            name: 'Test User',
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-jwt-token');
        return true;
    };

    const signOut = () => {
        // Mock logout
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        // Navigation will be handled by the component using this context
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// Add default export
export default AuthProvider;