import React, { useState } from 'react';
import './FlashcardComponent.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faCog, faSignOutAlt, faList, faBookOpen, faChartBar, faMedal } from '@fortawesome/free-solid-svg-icons';

const FlashcardPractice = () => {
    const [chosenTopic, setChosenTopic] = useState('');
    const [questionType, setQuestionType] = useState('');
    const [currentCard, setCurrentCard] = useState(null);
    const [cardFlipped, setCardFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const availableQuestionTypes = ["scenario", "theory", "coding"];

    const handleTopicChange = (event) => {
        setChosenTopic(event.target.value);
        setCurrentCard(null);
        setCardFlipped(false);
    };

    const handleQuestionTypeChange = (event) => {
        setQuestionType(event.target.value);
        setCurrentCard(null);
        setCardFlipped(false);
    };

    const fetchFlashcard = async (topic, type) => {
        setLoading(true);
        setError(null);

        // Log the topic and question type being sent to the backend
        console.log("Sending to backend - Topic:", topic, "Question Type:", type);

        try {
            const payload = { topic, question_type: type };
            console.log("Payload:", payload);  // Log the payload object

            const response = await fetch(`http://localhost:5000/generate_flashcard?unique=${Math.random()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to fetch flashcard data');
            }

            const data = await response.json();
            console.log("Received data from API:", data);  // Log the received response

            setCurrentCard({ question: data.question, answer: data.answer });
            setLoading(false);
        } catch (err) {
            console.error("Error fetching flashcard:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleFetchFlashcard = () => {
        if (chosenTopic && questionType) {
            fetchFlashcard(chosenTopic, questionType);
        } else {
            setError("Please enter a topic and select a question type.");
        }
    };

    const handleNextCard = () => {
        if (chosenTopic && questionType) {
            fetchFlashcard(chosenTopic, questionType);
        }
        setCardFlipped(false);
    };

    const handleCardFlip = () => {
        setCardFlipped(!cardFlipped);
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };

    const handleUpcomingTestClick = () => {
        navigate('/upcoming-tests');
    };

    const handleFlashCard = () => {
        navigate('/flashcards');
    };

    const Dashboard = () => {
        navigate('/student-dashboard');
    };

    const FlashcardHeader = () => (
        <div className="flashcard-header">
            <div className="flashcard-brand">
                <FontAwesomeIcon icon={faTachometerAlt} className="flashcard-icon" />
                <span className="flashcard-name">AutoAssess</span>
            </div>
            <div className="flashcard-header-icons">
                <FontAwesomeIcon icon={faCog} className="flashcard-header-icon" />
                <FontAwesomeIcon icon={faSignOutAlt} className="flashcard-header-icon" onClick={handleLogout} />
            </div>
        </div>
    );

    const FlashcardSidebar = () => (
        <div className="flashcard-sidebar">
            <a href="#" onClick={Dashboard}>
                <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
            </a>
            <a href="#" onClick={handleFlashCard}>
                <FontAwesomeIcon icon={faTasks} /> Practice Flashcards
            </a>
            <a href="#" onClick={handleUpcomingTestClick}>
                <FontAwesomeIcon icon={faBookOpen} /> Give test
            </a>
            <a href="#">
                <FontAwesomeIcon icon={faChartBar} /> Performance
            </a>
            <a href="#">
                <FontAwesomeIcon icon={faList} /> Scores
            </a>
            <a href="#">
                <FontAwesomeIcon icon={faMedal} /> Leaderboard
            </a>
        </div>
    );

    return (
        <div className="flashcard-dashboard-page">
            <FlashcardHeader />
            <div className="flashcard-dashboard-container">
                <FlashcardSidebar />
                <div className="flashcard-main-content">
                    <h2>Flashcard Practice</h2>
                    <div className="flashcard-topic-select">
                        <label>Enter a Topic:</label>
                        <input
                            type="text"
                            value={chosenTopic}
                            onChange={handleTopicChange}
                            placeholder="Type a topic (e.g., SQL Basics)"
                        />
                        <p className="topic-guide">Enter valid SQL topic names.</p>
                    </div>

                    <div className="flashcard-question-type-select">
                        <label>Select a Question Type:</label>
                        <select value={questionType} onChange={handleQuestionTypeChange}>
                            <option value="">-- Choose a Question Type --</option>
                            {availableQuestionTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <button className="flashcard-fetch-button" onClick={handleFetchFlashcard}>
                        Fetch Flashcard
                    </button>

                    {loading && <p>Loading flashcard...</p>}
                    {error && <p className="error">{error}</p>}

                    {currentCard && (
                        <div className="flashcard-wrapper">
                            <div className={`flashcard-box ${cardFlipped ? 'flipped' : ''}`} onClick={handleCardFlip}>
                                <div className="flashcard-front">
                                    <h3>{currentCard.question}</h3>
                                </div>
                                <div className="flashcard-back">
                                    <h3>{currentCard.answer}</h3>
                                </div>
                            </div>
                            <button className="flashcard-next-button" onClick={handleNextCard}>Next Flashcard</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlashcardPractice;
