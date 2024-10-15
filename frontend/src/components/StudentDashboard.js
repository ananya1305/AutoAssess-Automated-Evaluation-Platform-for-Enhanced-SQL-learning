import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto'; // Import Chart.js
import './StudentDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faCog, faSignOutAlt, faUsers, faList, faClipboardList, faBookOpen, faChartBar, faMedal, faClipboard } from '@fortawesome/free-solid-svg-icons';

const StudentDashboard = () => {
    const [user, setUser] = useState({});
    const [leaderboard, setLeaderboard] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown menu
    const [date, setDate] = useState(new Date()); // State for selected date in the calendar
    const [testDates, setTestDates] = useState([]); // State to hold test dates
    const [selectedTest, setSelectedTest] = useState(null); // State to hold selected test details
    const navigate = useNavigate();
    const pieChartRef = useRef(null); // Reference for pie chart

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:3002/api/auth/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setUser(response.data.user);
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login');
            }
        };

    
        const fetchTestDates = async () => {
            try {
                const response = await axios.get('http://localhost:3002/api/test/allTests'); // Fetch all tests (past & future)
                const tests = response.data.map(test => ({
                    date: new Date(test.date), // Convert the ISO string to a JS Date object
                    testName: test.testName,
                }));
                console.log("Fetched Tests:", tests); // Log the fetched test dates to verify
                setTestDates(tests); // Store test dates
            } catch (error) {
                console.error('Error fetching test dates:', error);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('http://localhost:3002/api/leaderboard');
                setLeaderboard(response.data);
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        };

        fetchUserData();
        fetchTestDates();
        fetchLeaderboard();
    }, [navigate]);

    const Header = () => {
        return (
            <div className="student-header-container">
                <div className="student-brand-logo" onClick={() => navigate('/student-dashboard')}>
                    <FontAwesomeIcon icon={faTachometerAlt} className="student-brand-icon" />
                    <span className="student-brand-name">AutoAssess</span>
                </div>
                <div className="student-search-bar">
                    <input type="text" placeholder="Search" />
                </div>
                <div className="student-header-icons">
                    <FontAwesomeIcon icon={faCog} className="student-header-icon" />
                    <FontAwesomeIcon icon={faSignOutAlt} className="student-header-icon" onClick={() => handleLogout()} />
                        <div className="student-profile-dropdown">
                            <img
                                src="https://vectorified.com/images/profile-picture-icon-27.png"
                                alt="Profile"
                                className="student-profile-pic"
                                onClick={toggleDropdown}
                            />
                            {dropdownOpen && (
                                <div className="student-dropdown-menu">
                                    <button onClick={handleEditProfile}>Edit Profile</button>
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (pieChartRef.current) {
            pieChartRef.current.destroy();
        }

        if (user.performance && user.performance.length > 0) {
            const ctx = document.getElementById('performanceChart').getContext('2d');
            pieChartRef.current = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: user.performance.map(perf => perf.testName),
                    datasets: [{
                        label: 'Scores',
                        data: user.performance.map(perf => perf.totalScore),
                        backgroundColor: ['#A0D1FB', '#E4E9F0', '#B9C6DF', '#7BAAF8'],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        }
    }, [user]);

    const normalizeDate = (date) => {
        return date.toISOString().split('T')[0]; // Get the YYYY-MM-DD part
    };

    // Handle date change in the calendar
    const onDateChange = (newDate) => {
        setDate(newDate);
        const normalizedDate = normalizeDate(newDate);
        const selected = testDates.find(test => normalizeDate(test.date) === normalizedDate);
        setSelectedTest(selected);
    };

    // Highlight dates with tests
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const normalizedDate = normalizeDate(date);
            const test = testDates.find(test => normalizeDate(test.date) === normalizedDate);
            return test ? <div className="student-highlight-dot"></div> : null;
        }
    };

    // Toggle the dropdown menu
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Handle edit profile (navigate to profile editing page)
    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    // Handle logout (clear token and navigate to login)
    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };

    const handleUpcomingTestClick = () => {
        navigate('/upcoming-tests');
    };
    const handleFlashCard = () => {
        navigate('/flashcards');
    };
    const handleScoresClick = () => {
        navigate('/score');  // Navigate to the Scores page
    };


    return (
        <div className="student-dashboard-page">
            <Header />
            <div className="student-dashboard-container">
                <div className="student-sidebar">
                    <a href="#" className='active'>
                        <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
                    </a>
                    <a href="#" onClick={handleUpcomingTestClick}>
                        <FontAwesomeIcon icon={faClipboardList} /> Upcoming Test
                    </a>
                    <a href="#" onClick={handleFlashCard}>
                        <FontAwesomeIcon icon={faTasks} /> Practice
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faBookOpen} /> Assignments
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faChartBar} /> Performance
                    </a>
                    <a href="#" onClick={handleScoresClick}>
                        <FontAwesomeIcon icon={faList} /> Scores
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faMedal} /> Leaderboard
                    </a>
                </div>

                <div className="student-main-content">
                    <div className="student-welcome-section">
                        <div>
                            <h2>Welcome, {user.firstName} {user.lastName}</h2>
                            <p>Branch {user.branch}</p>
                        </div>
                    </div>

                    <div className="student-content-grid">
                        <div className="student-give-test-btn">Give Test</div>
                        <div className="student-performance">
                            <h3>Your Performance (Pie Chart)</h3>
                            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                                <canvas id="performanceChart"></canvas>
                            </div>
                        </div>
                        <div className="student-leaderboard">
                            <h3>Latest Test Leaderboard</h3>
                            <ul className="student-leaderboard-list">
                                {leaderboard.map((student, index) => (
                                    <li key={index}>{index + 1}. {student.name} - {student.score}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
