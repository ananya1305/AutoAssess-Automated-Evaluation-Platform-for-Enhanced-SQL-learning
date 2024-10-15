import React from 'react';
import './ClassLeaderboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faChartBar, faCog, faSignOutAlt, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; 

const ClassLeaderboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const handleDashboardRedirect = () => {
    navigate('/teacher-dashboard');
  };

  const recentLeaderboard = [
    { rank: 1, name: 'Ananya Joshi', marks: 98 },
    { rank: 2, name: 'Arman Motiwala', marks: 95 },
    { rank: 3, name: 'Siddharth Shah', marks: 92 },
    { rank: 4, name: 'Neha Desai', marks: 89 },
  ];

  const sevenDaysAgoLeaderboard = [
    { rank: 1, name: 'Rahul Sharma', marks: 94 },
    { rank: 2, name: 'Anjali Mehta', marks: 92 },
    { rank: 3, name: 'Karan Patel', marks: 89 },
    { rank: 4, name: 'Priya Nair', marks: 85 },
  ];

  return (
    <div className="cl-dashboard-page">
      <div className="cl-header-container">
        <div className="cl-brand-logo" onClick={handleDashboardRedirect}>
          <FontAwesomeIcon icon={faTachometerAlt} className="cl-brand-icon" />
          <span className="cl-brand-name">AutoAssess</span>
        </div>
        <div className="cl-header-icons">
          <FontAwesomeIcon icon={faCog} className="cl-header-icon" />
          <FontAwesomeIcon icon={faSignOutAlt} className="cl-header-icon" onClick={handleLogout} />
        </div>
      </div>

      <div className="cl-dashboard-container">
        <div className="cl-sidebar">
          <a href="/teacher-dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
          </a>
          <a href="/create-test">
            <FontAwesomeIcon icon={faTasks} /> Create Test
          </a>
          <a href="/student-performances">
            <FontAwesomeIcon icon={faChartBar} /> Student Performance
          </a>
          <a href="/class-leaderboard" className="cl-active">
            <FontAwesomeIcon icon={faTrophy} /> Class Leaderboard
          </a>
          <a href="#">
            <FontAwesomeIcon icon={faCog} /> Settings
          </a>
        </div>

        <div className="cl-main-content">
          <div className="cl-leaderboard-container">
            <div className="cl-leaderboard-section">
              <h2>Recent Leaderboard</h2>
              <table className="cl-leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaderboard.map((student) => (
                    <tr key={student.rank}>
                      <td>{student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}</td>
                      <td>{student.name}</td>
                      <td>{student.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cl-leaderboard-section">
              <h2>7 Days Ago Leaderboard</h2>
              <table className="cl-leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {sevenDaysAgoLeaderboard.map((student) => (
                    <tr key={student.rank}>
                      <td>{student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}</td>
                      <td>{student.name}</td>
                      <td>{student.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassLeaderboard;
