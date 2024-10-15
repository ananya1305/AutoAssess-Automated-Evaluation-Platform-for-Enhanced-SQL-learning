import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [college, setCollege] = useState('');
    const [branch, setBranch] = useState('');
    const [semester, setSemester] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [role, setRole] = useState('student'); // Default role is student
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await axios.post('http://localhost:3002/api/auth/register', {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,  // Include confirmPassword in the payload
                college,
                branch: role === 'student' ? branch : '',
                semester: role === 'student' ? semester : '',
                rollNo: role === 'student' ? rollNo : '',
                role,  // Ensure role is sent
            });
            navigate('/login');
        } catch (error) {
            setError('Failed to register');
        }
    };

    return (
        <div className="signup-container">
            <header className="signup-header">
                <h1>AutoAssess</h1>
                <a href="/login" className="login-link">Login</a>
            </header>
            <div className="signup-form">
                <h2>Sign Up</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSignup}>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="College"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        required
                    />

                    {/* Conditional Fields */}
                    {role === 'student' && (
                        <>
                            <input
                                type="text"
                                placeholder="Branch"
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Semester"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Roll No"
                                value={rollNo}
                                onChange={(e) => setRollNo(e.target.value)}
                                required
                            />
                        </>
                    )}

                    {/* Role Selection */}
                    <div className="role-selection">
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="student"
                                checked={role === 'student'}
                                onChange={(e) => setRole(e.target.value)}
                            />
                            Student
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="teacher"
                                onChange={(e) => setRole(e.target.value)}
                            />
                            Teacher
                        </label>
                    </div>
                    
                    <button type="submit" className="signup-button">Sign Up</button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
