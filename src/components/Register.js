import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
    useEffect(() => {
        document.title = "Register";
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                email,
                password,
            });
            
            console.log('Registered:', response.data);
            setSuccessMessage('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
            console.error('Error registering:', error);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2>Create an Account</h2>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                
                <button onClick={handleRegister}>Register</button>
                
                <p>
                    Already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
