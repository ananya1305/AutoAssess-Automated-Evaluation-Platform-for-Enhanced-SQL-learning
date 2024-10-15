import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TakeTest.css';

const TakeTest = () => {
    const { testId } = useParams();
    const [test, setTest] = useState(null);  // Store test data
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);  // Handle question navigation
    const [answers, setAnswers] = useState([]);  // Store student's answers
    const [student, setStudent] = useState(null);  // Store student data
    const [timeRemaining, setTimeRemaining] = useState(null); // Timer state
    const timerRef = useRef(null); // Reference to the timer
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);  // Loading state

    // Ensure the student is logged in
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login');  // Redirect to login if no token found
            return;
        }

        const fetchStudentData = async () => {
            try {
                const response = await axios.get('http://localhost:3002/api/auth/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStudent(response.data.user);  // Store student data
            } catch (error) {
                console.error('Error fetching student data:', error);
                navigate('/login');
            }
        };

        fetchStudentData();
    }, [navigate]);

    // Fetch test details
    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3002/api/test/${testId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
                });
                const testData = response.data;
                setTest(testData);
                setAnswers(new Array(testData.questions.length).fill(""));  // Initialize empty answers
                setTimeRemaining(testData.duration * 60); // Convert duration from minutes to seconds
            } catch (error) {
                console.error('Error fetching test details:', error);
            }
        };

        fetchTestDetails();
    }, [testId]);

    // Countdown timer logic
    useEffect(() => {
        if (timeRemaining === null) return;

        if (timeRemaining <= 0) {
            handleSubmitTest(); // Auto-submit the test when time runs out
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeRemaining((prevTime) => prevTime - 1);
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(timerRef.current);
    }, [timeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleAnswerChange = (e) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = e.target.value;  // Update the answer for the current question
        setAnswers(newAnswers);
    };

    const handleSubmitTest = async () => {
        if (!student) {
            alert('Unable to submit test: Student not found');
            return;
        }
        setLoading(true);
        try {
            // Submit test answers
            await axios.post(`http://localhost:3002/api/test/${testId}/submit`, { answers, studentId: student._id }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
            });
            
            // Redirect to 'Test Submitted' page immediately
            navigate(`/test-submitted`);
        } catch (error) {
            console.error('Error submitting test:', error);
            alert('Failed to submit the test.');
        } finally {
            setLoading(false);
        }
    };

    // Ensure test and questions are defined before accessing them
    if (!test || !test.questions || test.questions.length === 0) {
        return <p>Loading test...</p>;
    }

    return (
        <div className="take-test-container">
            <div className="timer-display">
                <h3>Time Remaining: {formatTime(timeRemaining)}</h3>
            </div>
            <div className="schema-section">
                <h3>Schema</h3>
                <pre>{test.schema}</pre>  {/* Display the schema */}
            </div>
            <div className="question-section">
                {test.questions[currentQuestionIndex] ? (
                    <>
                        <h3>Question {currentQuestionIndex + 1}</h3>
                        <p>{test.questions[currentQuestionIndex].questionText}</p>
                        <textarea
                            value={answers[currentQuestionIndex]}
                            onChange={handleAnswerChange}
                            placeholder="Enter your answer"
                        />
                        <div className="navigation-buttons">
                            {currentQuestionIndex > 0 && (
                                <button onClick={handlePreviousQuestion}>Previous Question</button>
                            )}
                            {currentQuestionIndex < test.questions.length - 1 ? (
                                <button onClick={handleNextQuestion}>Next Question</button>
                            ) : (
                                <button onClick={handleSubmitTest} disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Test'}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <p>Loading question...</p>
                )}
            </div>
        </div>
    );
};

export default TakeTest;