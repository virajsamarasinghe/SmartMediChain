import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { MedicineProvider } from './context/MedicineContext';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    return (
        <AuthProvider>
            <MedicineProvider>
                <AppRoutes />
                <ToastContainer />
            </MedicineProvider>
        </AuthProvider>
    );
};

export default App;