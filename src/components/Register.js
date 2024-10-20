import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css'; // Add your styles

const Register = () => {
    useEffect(() => {
        document.title = "Register"; // Change this to the desired title
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');

        try {
            // Send registration request
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
        <div className="register-background">
            <div className="form-container">
                <h2>Create Account</h2>
                {error && <p className="error">{error}</p>}
                

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
                {successMessage && <p className="success">{successMessage}</p>}
            </div>
        </div>
    );
};

export default Register;
