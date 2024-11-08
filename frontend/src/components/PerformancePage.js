// PerformancePage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import './PerformancePage.css';

const PerformancePage = () => {
    const [user, setUser] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:3002/api/auth/user', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                setUser(response.data.user);
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login');
            }
        };
        fetchUserData();
    }, [navigate]);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            if (!user || !user._id) return;

            try {
                const response = await axios.get(`http://localhost:5000/performance/${user._id}`);
                setPerformanceData(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching performance data:', error);
                setError('Failed to fetch performance data.');
            } finally {
                setLoading(false);
            }
        };
        fetchPerformanceData();
    }, [user]);

    if (!performanceData) {
        return loading ? (
            <div className="loading-message">Loading performance data...</div>
        ) : (
            <div className="error-message">{error}</div>
        );
    }

    const { averageScore, bestScore, worstScore, totalTests, recentTests } = performanceData;

    // Chart data configurations
    const lineData = {
        labels: recentTests.map((_, index) => `Test ${index + 1}`), // Labels as "Test 1," "Test 2," etc.
        datasets: [
            {
                label: 'Scores Over Time (%)',
                data: recentTests.map((test) => (test.totalScore / test.totalPossibleScore) * 100),
                fill: false,
                borderColor: '#4CAF50',
                tension: 0.1,
            },
        ],
    };
    

    const barData = {
        labels: recentTests.map((test) => test.testName || new Date(test.dateTaken).toLocaleDateString()),
        datasets: [
            {
                label: 'Test Scores (%)',
                data: recentTests.map((test) => (test.totalScore / test.totalPossibleScore) * 100),
                backgroundColor: '#2d9cdb',
            },
        ],
    };

    return (
        <div className="student-performance-page">
            <h1>Student Performance Dashboard</h1>
            <div className="dashboard-container">
                <div className="left-section">
                    <h2>Performance Summary</h2>
                    <p><strong>Total Tests Taken:</strong> {totalTests}</p>
                    <p><strong>Average Score:</strong> {averageScore.toFixed(2)}%</p>
                    <p><strong>Best Score:</strong> {bestScore.toFixed(2)}%</p>
                    <p><strong>Worst Score:</strong> {worstScore.toFixed(2)}%</p>
                </div>
                <div className="middle-section">
                    <h3>Score Trends Over Time</h3>
                    <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
                <div className="right-section">
                    <h3>Recent Test Scores</h3>
                    <div className="doughnut-charts">
                        {recentTests.map((test, index) => {
                            const data = {
                                labels: ['Score', 'Remaining'],
                                datasets: [
                                    {
                                        data: [
                                            (test.totalScore / test.totalPossibleScore) * 100,
                                            100 - (test.totalScore / test.totalPossibleScore) * 100,
                                        ],
                                        backgroundColor: ['#4CAF50', '#E0E0E0'],
                                    },
                                ],
                            };
                            return (
                                <div className="doughnut-chart" key={index}>
                                    <Doughnut data={data} options={{ cutout: '80%', maintainAspectRatio: false }} />
                                    <p className="doughnut-label">{test.testName}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="bottom-section">
                <h3>Test Performance Distribution</h3>
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, maxBarThickness: 40 }} />
            </div>
        </div>
    );
};

export default PerformancePage;
