import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import { useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2'; // Importing the Line chart from chart.js
import './TeacherDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faCog, faSignOutAlt, faUsers, faList, faClipboardList, faBookOpen, faChartBar, faMedal } from '@fortawesome/free-solid-svg-icons';

const TeacherDashboard = () => {
  const [user, setUser] = useState({});
  const [date, setDate] = useState(new Date()); // State for selected date in the calendar
  const [testDates, setTestDates] = useState([]); // State to hold test dates
  const [selectedTest, setSelectedTest] = useState(null); // State to hold selected test details
  const [leaderboardData, setLeaderboardData] = useState([]); // Leaderboard data
  const navigate = useNavigate();

  // Fetch user and test data
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
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    const fetchTestDates = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/test/upcoming');
        const tests = response.data.map((test) => {
          // Extract date components and adjust to prevent time zone shift
          const scheduledDate = new Date(test.scheduledDate);
          const correctedDate = new Date(
            scheduledDate.getUTCFullYear(),
            scheduledDate.getUTCMonth(),
            scheduledDate.getUTCDate()
          );
    
          return {
            testId: test.testId,
            testName: test.testName,
            scheduledDate: correctedDate, // Use the corrected date
            maxScore: test.maxScore,
          };
        });
        setTestDates(tests);
      } catch (error) {
        console.error('Error fetching test dates:', error);
      }
    };
    

  
    const fetchLeaderboardData = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/leaderboard');
        setLeaderboardData(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchUserData();
    fetchTestDates();
    fetchLeaderboardData(); // Simulate leaderboard fetch
  }, [navigate]);

  // Normalize date to YYYY-MM-DD (ignoring time)
  const normalizeDate = (date) => {
    // Ensure we are dealing with a valid Date object
    return date instanceof Date && !isNaN(date) ? date.toISOString().split('T')[0] : null;
  };


  // Handle date change in the calendar
  const onDateChange = (newDate) => {
    setDate(newDate);
    const normalizedDate = normalizeDate(newDate);
    console.log('Selected Date:', normalizedDate); // Log selected date
    const selected = testDates.find(
      (test) => normalizeDate(test.scheduledDate) === normalizedDate
    );
    console.log('Selected Test:', selected); // Log the selected test (or null if no match)
    setSelectedTest(selected); // Set selected test if a match is found
  };

  // Highlight dates with tests
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const normalizedDate = normalizeDate(date);
      const test = testDates.find(
        (test) => test.scheduledDate && normalizeDate(test.scheduledDate) === normalizedDate
      );
      
      // Debugging: Check the dates being compared
      console.log("Calendar Date:", normalizedDate);
      if (test) {
        console.log("Matching Test Date:", normalizeDate(test.scheduledDate));
      }
  
      return test ? <div className="teacher-highlight-dot"></div> : null;
    }
  };

  // Handle logout (clear token and navigate to login)
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  // Handle edit profile (navigate to profile editing page)
  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  // Handle navigation to create test page
  const handleCreateTest = () => {
    navigate('/create-test');
  };

  // Handle navigation to student performance page
  const handlePerformance = () => {
    navigate('/student-performances');
  };

  const handleClassLeaderboard = () => {
    navigate('/class-leaderboard');
  };

  // Sample data for class performance bar chart (updated)
  const classPerformanceData = {
    labels: ['Btech AI', 'Btech CS', 'Cybersecurity'],
    datasets: [
      {
        label: 'Class Performance',
        data: [75, 80, 65],
        backgroundColor: ['#4badef', '#96b5fa', '#badbfc'], // Softer, gradient colors
        borderRadius: 10, // Rounded bars to match the design
      },
    ],
  };

  // Sample data for class progress over time (hardcoded)
  const classProgressData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Class Progress',
        data: [60, 65, 70, 75, 73, 76, 80, 82, 85],
        fill: false,
        borderColor: '#4badef',
        tension: 0.1,
      },
    ],
  };

  const Header = () => {
    return (
      <div className="teacher-header-container">
        <div className="teacher-brand-logo">
          <FontAwesomeIcon icon={faTachometerAlt} className="teacher-brand-icon" />
          <span className="teacher-brand-name">AutoAssess</span>
        </div>
        <div className="teacher-search-bar">
          <input type="text" placeholder="Search" />
        </div>
        <div className="teacher-header-icons">
          <FontAwesomeIcon icon={faCog} className="teacher-header-icon" />
          <FontAwesomeIcon icon={faSignOutAlt} className="teacher-header-icon" />
          <div className="teacher-user-info">
            <span>{user.firstName} {user.lastName}</span>
            <img src="https://via.placeholder.com/40" alt="User" className="teacher-user-avatar" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-dashboard-page">
      {/* Header Section */}
      <Header />

      <div className="teacher-dashboard-container">
      <div className="teacher-sidebar">
        <div className="teacher-branding">
            <FontAwesomeIcon icon={faTachometerAlt} className="teacher-brand-icon" />
            <span className="teacher-brand-name">AutoAssess</span>
        </div>

        <a href="#">
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
        </a>
        <a onClick={handleCreateTest}>
            <FontAwesomeIcon icon={faTasks} /> Manage Tests
        </a>
        <a onClick={handlePerformance}>
            <FontAwesomeIcon icon={faChartBar} /> Student Performance
        </a>
        <a onClick={handleClassLeaderboard}>
            <FontAwesomeIcon icon={faClipboardList} /> Class Leaderboard
        </a>
        <a href="#">
            <FontAwesomeIcon icon={faCog} /> Settings
        </a>
        <a href="#">
            <FontAwesomeIcon icon={faList} /> Select Class
        </a>
        <a href="#">
            <FontAwesomeIcon icon={faUsers} /> Student List
        </a>
        <a href="#">
            <FontAwesomeIcon icon={faBookOpen} /> Assignments
        </a>
        <a onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </a>
        </div>


        <div className="teacher-main-content">
          {/* Left Section: Bar Chart and Student Stats */}
          <div>
            <div className="teacher-welcome-section">
              <div>
                <h2>Welcome, {user.firstName} {user.lastName}</h2>
                <p>
                  Your students' average progress is <span className="teacher-progress-highlight">73%</span>. Level up your students to improve your teacher rank!
                </p>
              </div>
            </div>

            <div className="teacher-working-hours-container">
              <div className="teacher-working-hours">
                <h3>Class Performance</h3>
                <div className="teacher-chart-placeholder">
                  {/* Class performance bar chart */}
                  <Bar data={classPerformanceData} />
                </div>
              </div>

              {/* Class Progress Graph */}
              <div className="teacher-class-progress">
                <h3>Class Progress Over Time</h3>
                <div className="teacher-chart-placeholder">
                  {/* Class progress line chart */}
                  <Line data={classProgressData} />
                </div>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="teacher-student-leaderboard">
              <h3>Student Leaderboard</h3>
              <ul className="teacher-leaderboard-list">
                {leaderboardData.map((student, index) => (
                  <li key={index} className="teacher-leaderboard-item">
                    <div className="teacher-leaderboard-rank">{index + 1}</div>
                    <div className="teacher-leaderboard-name">{student.name}</div>
                    <div className="teacher-leaderboard-marks">{student.score} Marks</div>
                    <div className="teacher-leaderboard-icon">
                      <FontAwesomeIcon
                        icon={faMedal}
                        style={{ color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '#fca311' }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Section: User Profile, Calendar, Upcoming Tests */}
          <div className="teacher-right-section">
            {/* User Profile Section */}
            <div className="teacher-user-profile">
              <h3>{user.firstName} {user.lastName}</h3>
              <button onClick={handleEditProfile}>Edit Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>

            {/* Calendar Section */}
            <div className="teacher-calendar-container">
              <h3>Test Schedule</h3>
              <Calendar
                onChange={onDateChange}
                value={date}
                tileContent={tileContent}
                className="teacher-react-calendar"
              />
              {selectedTest ? (
                <div className="teacher-test-details">
                  <h4>Test Scheduled: {selectedTest.testName}</h4>
                  
                  <h4>Marks: {selectedTest.maxScore}</h4> 
                </div>
              ) : (
                <div className="teacher-test-details">
                  <h4>No Test Scheduled for the selected date.</h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
