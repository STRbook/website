import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api'; 

import './Login.css';

const Login = () => {
    useEffect(() => {
        document.title = "Login"; 
    }, []);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userRole, setUserRole] = useState('student'); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState(eyeOff);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        
        const loginEndpoint = userRole === 'student' ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.TEACHER_LOGIN;

        try {
            const response = await fetch(loginEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password
                }),
                
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Login failed as ${userRole}`);
            }

            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); 
            
            localStorage.removeItem('student_id');
            localStorage.removeItem('is_first_login');

            console.log("Login successful, user data:", data.user); 

            
            console.log("Checking role for navigation:", data.user.role); 
            if (data.user.role === 'teacher') {
                console.log("Navigating to /teacher-dashboard"); 
                navigate('/teacher-dashboard', { replace: true });
            } else if (data.user.role === 'student') {
                 console.log("Navigating based on student status"); 
                navigate(data.user.is_first_login ? '/student-profile' : '/timetable', { replace: true });
            } else {
                 console.error("Unknown user role:", data.user.role); 
                setError('Login successful, but user role is unknown.');
                localStorage.removeItem('token'); 
                localStorage.removeItem('user');
            }

        } catch (err) {
            console.error(`Login error as ${userRole}:`, err);
            setError(err.message);
        } finally {
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
                    <form onSubmit={handleLogin}>
                        
                        <div className="role-selector">
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

                        <input
                            type="email"
                            placeholder="Email"
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="password-container">
                            <input
                            type={type}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <span className="toggle-icon" onClick={handleToggle}>
                            <Icon icon={icon} size={20} />
                            </span>
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <p>
                            <a href="/forgot-password">Forgot Password?</a>
                        </p>
                        <p>Don&apos;t have an account? <Link to="/register">Register here</Link></p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
