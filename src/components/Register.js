import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const handleRegister = () => {
        if (!email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');

        // TODO: Send registration request to your backend API here

        // Simulating a successful registration
        setTimeout(() => {
            console.log('Registered with:', email, password);
            navigate('/login'); // Redirect to login after registration
        }, 1500);
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
            </div>
        </div>
    );
};

export default Register;
