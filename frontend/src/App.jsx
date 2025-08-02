import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { MedicineProvider } from './context/MedicineContext';
import AppRoutes from './routes';

const App = () => {
    return (
        <AuthProvider>
            <MedicineProvider>
                <AppRoutes />
            </MedicineProvider>
        </AuthProvider>
    );
};

export default App;