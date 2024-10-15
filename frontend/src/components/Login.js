import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('http://localhost:3002/api/auth/login', { email, password });
            const { token, role, userId } = response.data; // Ensure userId is returned from backend
            localStorage.setItem('userToken', token);
            localStorage.setItem('studentId', userId);  // Save studentId here
    
            if (role === 'teacher') {
                navigate('/teacher-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (error) {
            setError('Invalid email or password');
        }
    };
    

    return (
        <div className="login-container">
            <header className="login-header">
                <h1>AutoAssess</h1>
                <a href="/signup" className="signup-link">Sign Up</a>
            </header>
            <div className="login-form">
                <h2>LOGIN</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
