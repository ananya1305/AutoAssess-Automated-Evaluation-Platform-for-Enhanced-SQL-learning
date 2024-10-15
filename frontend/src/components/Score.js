import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Score.css'; // Make sure to include this CSS file
import { useNavigate } from 'react-router-dom'; // For navigation

const Score = () => {
  const [gradedTests, setGradedTests] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null); // To handle errors
  const navigate = useNavigate(); // For navigation

  // Fetch user details using the token
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');  // Redirect to login if no token found
        return;
      }

      try {
        const response = await axios.get('http://localhost:3002/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(response.data.user);  // Store user data
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');  // Redirect to login on error
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch graded tests after getting the user details
  useEffect(() => {
    const fetchGradedTests = async () => {
      try {
        if (!user || !user._id) {
          setError('User ID not available');
          return;
        }

        // Fetch graded tests for the student
        const response = await axios.get(`http://localhost:5000/graded-tests/${user._id}`);
        
        if (response.status === 200) {
          setGradedTests(response.data.gradedTests);
        } else {
          setError('Failed to fetch graded tests');
        }
      } catch (err) {
        console.error('Error fetching graded tests:', err);
        setError('Failed to fetch graded tests');
      }
    };

    if (user) {
      fetchGradedTests();
    }
  }, [user]);

  const handleViewResult = (testId) => {
    // Navigate to detailed result page (implement routing as needed)
    navigate(`/test-result/${testId}/${user._id}`);
  };

  return (
    <div className="score-page">
      <h1 className="score-header">Your Graded Tests</h1>
      {error && <p className="error">{error}</p>}
      {gradedTests.length > 0 ? (
        <ul className="graded-test-list">
          {gradedTests.map((test, index) => (
            <li key={index} className="graded-test-item">
              <div className="test-item-container">
                <span className="test-name"> {test.testName}</span>
                <span className="test-score">Score: {test.totalScore} / {test.totalPossibleScore}</span>
                <button className="view-result-btn" onClick={() => handleViewResult(test.testId)}>View Result</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-tests-message">No graded tests available.</p>
      )}
    </div>
  );
};

export default Score;
