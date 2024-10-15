import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import { FaChartLine, FaRobot, FaTrophy } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      {/* Header */}
      <header className="landing-page-header">
        <div className="landing-page-header-left">
          <h1 className="landing-page-brand">AutoAssess</h1>
        </div>
        <div className="landing-page-header-right">
          <Link to="/login" className="landing-page-login-link">Login</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-page-hero-section">
        <video autoPlay muted loop className="landing-page-background-video">
          <source src="/videos/autoassess.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="landing-page-hero-content">
          <h1 className="landing-page-hero-title">Transform Learning</h1>
          <p className="landing-page-hero-description">Automate, Evaluate, and Improve your SQL queries with precision and efficiency.</p>
          <Link to="/signup" className="landing-page-cta-btn">Get Started</Link>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="landing-page-features-section">
        <div className="landing-page-feature">
          <FaChartLine className="landing-page-feature-icon" />
          <h2>Track Student Progress</h2>
          <p>Monitor performance with real-time analytics.</p>
        </div>
        <div className="landing-page-feature">
          <FaRobot className="landing-page-feature-icon" />
          <h2>Automated Grading</h2>
          <p>Evaluate SQL queries accurately using AI.</p>
        </div>
        <div className="landing-page-feature">
          <FaTrophy className="landing-page-feature-icon" />
          <h2>Interactive Leaderboards</h2>
          <p>Engage students with gamified learning.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
