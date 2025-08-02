import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
// No need for CSS import with Tailwind

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = (e) => {
        e.preventDefault();
        // Use our mock login function
        login(email, password);
        // Navigate to dashboard on successful login
        navigate('/dashboard');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">SmartMediChain</h1>
                <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">Login to your account</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <Input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <Button type="submit" className="w-full mt-4">Login</Button>
                </form>
            </div>
        </div>
    );
};

export default Login;