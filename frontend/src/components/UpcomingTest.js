import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpcomingTest.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faChartBar, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const UpcomingTest = () => {
    const [tests, setTests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await axios.get('http://localhost:3002/api/test/upcoming');
                setTests(response.data);
            } catch (error) {
                console.error('Error fetching tests:', error);
            }
        };

        fetchTests();
    }, []);

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

    return (
        <div className="upcoming-dashboard-page">
            <div className="header-container">
                <div className="brand-logo" onClick={handleDashboardRedirect}>
                    <FontAwesomeIcon icon={faTachometerAlt} className="brand-icon" />
                    <span className="brand-name">AutoAssess</span>
                </div>
                <div className="header-icons">
                    <FontAwesomeIcon icon={faCog} className="header-icon" />
                    <FontAwesomeIcon icon={faSignOutAlt} className="header-icon" onClick={handleLogout} />
                </div>
            </div>

            <div className="dashboard-container">
                <div className="sidebar">
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

                <div className="main-content">
                    <div className="upcoming-test-container">
                        <h2>Upcoming Tests</h2>
                        <ul>
                            {tests.map((test) => (
                                <li key={test.testId} onClick={() => handleTestClick(test.testId)}>
                                    {test.testName} - {new Date(test.scheduledDate).toDateString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpcomingTest;
