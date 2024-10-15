import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faChartBar, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './TestDetails.css';

const TestDetails = () => {
    const { testId } = useParams(); // Get test ID from route params
    const [test, setTest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3002/api/test/${testId}`); // Fetch the test details
                setTest(response.data);
            } catch (error) {
                console.error('Error fetching test details:', error);
            }
        };

        fetchTestDetails();
    }, [testId]);

    const handleTestClick = (testId) => {
        navigate(`/test-details/${testId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };

    const handleDashboardRedirect = () => {
        navigate('/student-dashboard');
    };

    const handleStartTest = () => {
        navigate(`/take-test/${testId}`); // Navigate to the test-taking page
    };

    return (
        <div className="test-details-dashboard-page">
            <div className="test-details-header-container">
                <div className="test-details-brand-logo" onClick={handleDashboardRedirect}>
                    <FontAwesomeIcon icon={faTachometerAlt} className="test-details-brand-icon" />
                    <span className="test-details-brand-name">AutoAssess</span>
                </div>
                <div className="test-details-header-icons">
                    <FontAwesomeIcon icon={faCog} className="test-details-header-icon" />
                    <FontAwesomeIcon icon={faSignOutAlt} className="test-details-header-icon" onClick={handleLogout} />
                </div>
            </div>

            <div className="dashboard-container">
                <div className="test-details-sidebar">
                    <a href="/student-dashboard">
                        <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
                    </a>
                    <a href="/upcoming-tests" className="active">
                        <FontAwesomeIcon icon={faTasks} /> Upcoming Tests
                    </a>
                    <a href="/student-performances">
                        <FontAwesomeIcon icon={faChartBar} /> Performance
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faCog} /> Settings
                    </a>
                </div>
                
                {/* Main content area */}
                <div className="test-details-main-content">
                    <div className="test-details-container">
                        {test ? (
                            <>
                                <h2>{test.testName}</h2>
                                <button onClick={handleStartTest}>Start Test</button>
                            </>
                        ) : (
                            <p>Loading test details...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestDetails;
