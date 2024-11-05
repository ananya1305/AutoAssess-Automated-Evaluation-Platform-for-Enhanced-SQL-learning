import React from 'react';
import './CreateTest.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faCog, faSignOutAlt, faUsers, faList, faClipboardList, faBookOpen, faChartBar, faMedal } from '@fortawesome/free-solid-svg-icons';
import automationImg1 from './automation1.png';
import automationImg2 from './automation2.png';


import { useNavigate } from 'react-router-dom';

const CreateTestPage = () => {
  const navigate = useNavigate();

  const handleSingleDatasetClick = () => {
    navigate('/create-test/single-dataset');
  };

  const handleMultipleDatasetClick = () => {
    navigate('/create-test/multiple-datasets');
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const handleDashboardRedirect = () => {
    navigate('/teacher-dashboard');
  };
  const handlePerformance = () => {
    navigate('/student-performances');
  };

  const handleClassLeaderboard = () => {
    navigate('/class-leaderboard');
  };

  return (
    <div className="ct-dashboard-page">
      <div className="ct-header-container">
        <div className="ct-brand-logo" onClick={handleDashboardRedirect}>
          <FontAwesomeIcon icon={faTachometerAlt} className="ct-brand-icon" />
          <span className="ct-brand-name">AutoAssess</span>
        </div>
        <div className="ct-header-icons">
          <FontAwesomeIcon icon={faCog} className="ct-header-icon" />
          <FontAwesomeIcon icon={faSignOutAlt} className="ct-header-icon" onClick={handleLogoutClick} />
        </div>
      </div>

      <div className="ct-dashboard-container">
      <div className="teacher-sidebar">
        <div className="teacher-branding">
            <FontAwesomeIcon icon={faTachometerAlt} className="teacher-brand-icon" />
            <span className="teacher-brand-name">AutoAssess</span>
        </div>

        <a href={'./teacher-dashboard'}>
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
        </a>
        <a href={'./create-test'}>
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
        <a onClick={handleLogoutClick}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </a>
        </div>

        <div className="ct-main-content">
          <h2>Select Test Creation Mode</h2>
          <div className="ct-menu-container">
            <div className="ct-menu-block" onClick={handleSingleDatasetClick}>
            <img src={automationImg2} alt="Description of Image 2" />
              <h3>Generate Questions on a Single Dataset</h3>
              <p>Upload one dataset to generate questions.</p>
            </div>
            <div className="ct-menu-block" onClick={handleMultipleDatasetClick}>
              <img src={automationImg1} alt="Description of Image 1" />
              <h3>Generate Questions on Multiple Datasets</h3>
              <p>Upload multiple datasets for complex tests using joins.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTestPage;
