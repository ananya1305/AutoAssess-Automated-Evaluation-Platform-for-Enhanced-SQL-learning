import React, { useState } from 'react';

const Flashcard = ({ question, answer }) => {
    const [showAnswer, setShowAnswer] = useState(false);

    const handleFlip = () => {
        setShowAnswer(!showAnswer);
    };

    return (
        <div className="flashcard" onClick={handleFlip} style={{border: '1px solid black', padding: '20px', cursor: 'pointer', width: '300px', margin: '10px'}}>
            <div className="content">
                {!showAnswer ? <h3>{question}</h3> : <p>{answer}</p>}
            </div>
        </div>
    );
};

export default Flashcard;
