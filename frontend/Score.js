import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Scores.css';  // Create CSS for styling the page

const Scores = () => {
    const [gradedTests, setGradedTests] = useState([]);  // State for storing graded tests
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGradedTests = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/graded-tests/${token}`);  // Assuming `token` contains the user ID
                setGradedTests(response.data.gradedTests);  // Store graded tests
            } catch (error) {
                console.error('Error fetching graded tests:', error);
            }
        };

        fetchGradedTests();
    }, [navigate]);

    const handleViewTest = (testId) => {
        navigate(`/view-test/${testId}`);  // Navigate to the result page
    };

    return (
        <div className="scores-page">
            <h2>Your Graded Tests</h2>
            {gradedTests.length === 0 ? (
                <p>No tests graded yet.</p>
            ) : (
                <ul className="graded-test-list">
                    {gradedTests.map((test, index) => (
                        <li key={index} onClick={() => handleViewTest(test.testId)}>
                            {test.testName} - Score: {test.totalScore}/{test.totalPossibleScore}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Scores;
