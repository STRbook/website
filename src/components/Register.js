import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api'; // Import API endpoints
import './Register.css';

const Register = () => {
    useEffect(() => {
        document.title = "Register";
    }, []);

    const [email, setEmail] = useState('');
    // Removed duplicate email state declaration
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState(''); // Add first name state
    const [lastName, setLastName] = useState(''); // Add last name state
    const [userRole, setUserRole] = useState('student'); // Add role state, default to student
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError('');
        setSuccessMessage('');
        setLoading(true);

        // Basic validation
        if (!email || !password || !confirmPassword) {
            setError('Email and password fields are required');
            setLoading(false);
            return;
        }
        if (userRole === 'teacher' && (!firstName || !lastName)) {
             setError('First name and last name are required for teacher registration');
             setLoading(false);
             return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        
        // Determine endpoint and payload based on role
        const endpoint = userRole === 'student' ? API_ENDPOINTS.REGISTER : API_ENDPOINTS.TEACHER_REGISTER;
        const payload = userRole === 'student' 
            ? { email: email.trim().toLowerCase(), password }
            : { email: email.trim().toLowerCase(), password, first_name: firstName, last_name: lastName };

        try {
            const response = await axios.post(endpoint, payload);
            
            console.log(`Registered as ${userRole}:`, response.data);
            setSuccessMessage('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Redirect after 2 seconds

        } catch (err) {
            setError(err.response?.data?.message || `Registration as ${userRole} failed`);
            console.error(`Error registering as ${userRole}:`, err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2>Create an Account</h2>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                
                {/* Role Selector */}
                 <div className="role-selector register-role-selector"> {/* Add specific class */}
                    <label>
                        <input 
                            type="radio" 
                            name="role" 
                            value="student" 
                            checked={userRole === 'student'} 
                            onChange={(e) => setUserRole(e.target.value)} 
                        />
                        Student
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="role" 
                            value="teacher" 
                            checked={userRole === 'teacher'} 
                            onChange={(e) => setUserRole(e.target.value)} 
                        />
                        Teacher
                    </label>
                </div>

                {/* Conditional Fields for Teacher */}
                {userRole === 'teacher' && (
                    <>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required={userRole === 'teacher'}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required={userRole === 'teacher'}
                        />
                    </>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                
                {/* Use form onSubmit */}
                <form onSubmit={handleRegister} style={{width: '100%'}}> 
                    <button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                
                <p>
                    Already have an account? <Link to="/login">Login</Link> {/* Use Link */}
                </p>
            </div>
        </div>
    );
};

export default Register;
