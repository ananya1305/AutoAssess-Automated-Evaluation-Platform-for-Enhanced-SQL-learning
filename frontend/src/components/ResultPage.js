import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ResultPage.css';
import { useParams } from 'react-router-dom';

const ResultPage = () => {
    const { testId, studentId } = useParams();
    const [testDetails, setTestDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestResult = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/view-test/${testId}/${studentId}`);
                setTestDetails(response.data.testDetails);
            } catch (error) {
                console.error('Error fetching test details:', error);
                setError('Failed to fetch test details');
            }
        };

        if (testId && studentId) {
            fetchTestResult();
        } else {
            setError('Invalid test or student ID');
        }
    }, [testId, studentId]);

    // Function to parse and format feedback
    const parseFeedback = (feedback) => {
        const feedbackSections = {};
        const labels = ["Issue", "Correct Approach", "Tip", "Areas for Improvement", "Next Steps"];
        let remainingText = feedback;
    
        labels.forEach(label => {
            // Use \b for word boundaries to ensure standalone match for labels
            const regex = new RegExp(`(?:\\*\\*)?\\b${label}\\b(?:\\*\\*)?:\\s*(.*?)((?=\\n\\*\\*)|(?=\\n\\b${labels.join("\\b|\\b")})|$)`, 'is');
            const match = remainingText.match(regex);
    
            if (match) {
                feedbackSections[label] = match[1].trim();
                // Remove the matched portion from the remainingText to prevent re-matching
                remainingText = remainingText.replace(match[0], '');
            }
        });
    
        return feedbackSections;
    };
    
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!testDetails) {
        return <div className="loading-message">Loading test details...</div>;
    }

    return (
        <div className="result-container">
            <h1 className="result-header">Test Result: {testDetails.testName}</h1>

            <div className="question-list">
                {testDetails.questions.map((question, index) => (
                    <div key={index} className="question-card">
                        <h3 className="question-text">Question {index + 1}: {question.questionText}</h3>
                        <div className="student-answer">
                            <strong>Your Answer:</strong> {question.submittedAnswer}
                        </div>
                        <div className={`grade ${question.result === 'Correct' ? 'correct' : 'incorrect'}`}>
                            <strong>Score:</strong> {question.score} / 1
                        </div>
                        {question.feedback && question.result === "Incorrect" && (
                            <div className="feedback">
                                <h4>Feedback:</h4>
                                {Object.entries(parseFeedback(question.feedback)).map(([label, text]) => (
                                    <div key={label} className="feedback-section">
                                        <strong>{label}:</strong> {text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="total-score">
                <h2>Total Score: {testDetails.totalScore} / {testDetails.totalPossibleScore}</h2>
            </div>
        </div>
    );
};

export default ResultPage;
