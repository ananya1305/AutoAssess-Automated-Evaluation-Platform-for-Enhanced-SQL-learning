import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TestSubmitted.css'; // Optional CSS for styling

const TestSubmitted = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/student-dashboard'); // Navigate back to the student dashboard
  };

  return (
    <div className="test-submitted-container">
      <h2 className='heading'>Test Submitted Successfully!</h2>
      <p>Your test has been submitted. You will receive your score soon.</p>
      <button onClick={handleBackToDashboard} className="go-back-button">
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default TestSubmitted;
