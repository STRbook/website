import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';

import './Login.css';

const Login = () => {
    useEffect(() => {
        document.title = "Login"; 
    }, []);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState(eyeOff);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Email and Password are required');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            console.log('Attempting login with:', { email });
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Login response:', { status: response.status, data });

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('student_id', data.student.student_id);
            console.log('Login successful, stored token and student_id');

            setLoading(false);

            // Redirect based on first login status
            if (data.student.is_first_login) {
                console.log('Redirecting to profile (first login)');
                navigate('/student-profile');
            } else {
                console.log('Redirecting to dashboard');
                navigate('/student-dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (type === 'password') {
            setIcon(eye);
            setType('text');
        } else {
            setIcon(eyeOff);
            setType('password');
        }
    };

    return (
        <div className="login-background">
            <div className="form-container">
                <h2>Welcome! Please login to continue.</h2>
                {error && <p className="error">{error}</p>}
                {loading ? (
                    <div className="spinner"></div>
                ) : (
                    <>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="password-container">
                            <input
                                type={type}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="toggle-icon" onClick={handleToggle}>
                                <Icon icon={icon} size={20} />
                            </span>
                        </div>
                        <button onClick={handleLogin}>Login</button>
                        <p>
                            <a href="/forgot-password">Forgot Password?</a>
                        </p>
                        <p>
                            Don't have an account? <a href="/register">Register</a>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
