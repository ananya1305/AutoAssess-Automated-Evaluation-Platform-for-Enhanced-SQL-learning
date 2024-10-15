import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TakeTest.css';

const TakeTest = () => {
    const { testId } = useParams();
    const [test, setTest] = useState(null);  // Store test data
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);  // Handle question navigation
    const [answers, setAnswers] = useState([]);  // Store student's answers
    const [student, setStudent] = useState(null);  // Store student data
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
                setTest(response.data);
                setAnswers(new Array(response.data.questions.length).fill(""));  // Initialize empty answers
            } catch (error) {
                console.error('Error fetching test details:', error);
            }
        };

        fetchTestDetails();
    }, [testId]);

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
            
            // Call grading function (this happens in the background, without blocking the UI)
            handleGradeTest();

            // Redirect to 'Test Submitted' page immediately
            navigate(`/test-submitted`);
        } catch (error) {
            console.error('Error submitting test:', error);
            alert('Failed to submit the test.');
        } finally {
            setLoading(false);
        }
    };

    const handleGradeTest = async () => {
        try {
            // Perform grading in the background
            await axios.post(`http://localhost:5000/grade-test/${testId}/${student._id}`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
            });
            console.log('Test graded successfully!');
        } catch (error) {
            console.error('Error grading test:', error);
        }
    };

    // Ensure test and questions are defined before accessing them
    if (!test || !test.questions || test.questions.length === 0) {
        return <p>Loading test...</p>;
    }

    return (
        <div className="take-test-container">
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
