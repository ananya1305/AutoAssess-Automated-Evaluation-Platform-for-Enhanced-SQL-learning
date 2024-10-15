import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './StudentPerformance.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faCog, faSignOutAlt, faUsers, faList, faClipboardList, faBookOpen, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const StudentPerformance = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [students, setStudents] = useState([]);
    const [studentPerformance, setStudentPerformance] = useState(null);
    const pieChartRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch branches from the backend or define them statically
        setBranches(['Btech AI', 'Btech CS', 'Btech IT']);
    }, []);

    const handleBranchChange = async (branch) => {
        setSelectedBranch(branch);
        setSelectedSemester('');
        setStudents([]);
        setStudentPerformance(null);

        try {
            const response = await axios.get(`http://localhost:3002/api/students/branch/${branch}`);
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleSemesterChange = async (semester) => {
        setSelectedSemester(semester);
        setStudentPerformance(null);

        try {
            const response = await axios.get(`http://localhost:3002/api/students/branch/${selectedBranch}/semester/${semester}`);
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleStudentClick = async (studentId) => {
        try {
            const response = await axios.get(`http://localhost:3002/api/students/${studentId}/performance`);
            console.log('Performance Data:', response.data);  // Logging data to verify
    
            // Correct the condition to check response.data directly
            if (response.data && response.data.length > 0) {
                setStudentPerformance(response.data);
                renderPieChart(response.data);  // Pass the correct data for the chart rendering
            } else {
                console.error('No performance data found.');
                setStudentPerformance(null); // Reset the chart if no data is found
            }
        } catch (error) {
            console.error('Error fetching student performance:', error);
        }
    };

    const renderPieChart = (performance) => {
        if (pieChartRef.current) {
            pieChartRef.current.destroy();  // Destroy the previous chart instance
        }
    
        // Check if performance data is valid and non-empty
        if (performance && performance.length > 0 && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            pieChartRef.current = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: performance.map(perf => perf.testName),  // Use testName directly
                    datasets: [{
                        label: 'Scores',
                        data: performance.map(perf => perf.totalScore),  // Use totalScore
                        backgroundColor: ['#3cba9f', '#e8c3b9', '#c45850', '#8e5ea2', '#3e95cd'],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        } else {
            console.error('Invalid or empty performance data.');
        }
    };
    
    

    const Header = () => {
        return (
            <div className="header-container">
                <div className="brand-logo" onClick={() => navigate('/dashboard')}>
                    <FontAwesomeIcon icon={faTachometerAlt} className="brand-icon" />
                    <span className="brand-name">AutoAssess</span>
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Search" />
                </div>
                <div className="header-icons">
                    <FontAwesomeIcon icon={faCog} className="header-icon" />
                    <FontAwesomeIcon icon={faSignOutAlt} className="header-icon" onClick={() => handleLogout()} />
                </div>
            </div>
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };

    return (
        <div className="dashboard-page">
            <Header />
            <div className="dashboard-container">
                <div className="sidebar">
                    <a href="./teacher-dashboard">
                        <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
                    </a>
                    <a href="./Createtest.js">
                        <FontAwesomeIcon icon={faTasks} /> Manage Tests
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faChartBar} /> Student Performance
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faClipboardList} /> Class Leaderboard
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faCog} /> Settings
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faUsers} /> Student List
                    </a>
                    <a href="#">
                        <FontAwesomeIcon icon={faBookOpen} /> Assignments
                    </a>
                    <a href="#" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                    </a>
                </div>

                <div className="main-content">
                    <div className="student-performance-container">
                        <h2>Select Branch and Semester</h2>
                        <div>
                            <label>Branch:</label>
                            <select onChange={(e) => handleBranchChange(e.target.value)} value={selectedBranch}>
                                <option value="">Select Branch</option>
                                {branches.map((branch) => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedBranch && (
                            <div>
                                <label>Semester:</label>
                                <select onChange={(e) => handleSemesterChange(e.target.value)} value={selectedSemester}>
                                    <option value="">Select Semester</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                        <option key={sem} value={sem}>
                                            {sem}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {selectedBranch && selectedSemester && (
                            <div>
                                <h3>Students</h3>
                                <ul>
                                    {students.map((student) => (
                                        <li key={student._id} onClick={() => handleStudentClick(student._id)}>
                                            {student.firstName} {student.lastName}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {studentPerformance && (
                            <div className="student-performance-chart">
                                <h3>Student Performance</h3>
                                <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                                    <canvas ref={canvasRef} id="performanceChart"></canvas>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPerformance;
