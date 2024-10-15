import React, { useState } from 'react';
import './FlashcardComponent.css'; // Updated CSS
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faCog, faSignOutAlt, faList, faBookOpen, faChartBar, faMedal } from '@fortawesome/free-solid-svg-icons';

const FlashcardPractice = () => {
    const [chosenTopic, setChosenTopic] = useState(''); // Selected topic by user
    const [currentCardIndex, setCurrentCardIndex] = useState(0); // Track current flashcard
    const [cardFlipped, setCardFlipped] = useState(false); // Track flip state
    const navigate = useNavigate();

    // Hardcoded flashcards for each topic
    const cardContent = {
        "SQL Basics": [
            { question: "What is SQL?", answer: "SQL (Structured Query Language) is used to manage and manipulate relational databases." },
            { question: "What is a database?", answer: "A database is an organized collection of data, generally stored and accessed electronically." },
            { question: "What is a table?", answer: "A table is a collection of data organized into rows and columns in a relational database." },
            { question: "What is a primary key?", "answer": "A primary key is a unique identifier for a record in a table, ensuring that no two rows have the same value in this column." },
            { question: "What is a foreign key?", "answer": "A foreign key is a column or set of columns that establish a relationship between data in two tables." },
            { question: "What does the SELECT statement do?", "answer": "The SELECT statement retrieves data from one or more tables in a database." },
            { question: "What is the purpose of the WHERE clause?", "answer": "The WHERE clause filters records based on specific conditions in a query." },
            { question: "What is the difference between a NULL value and a blank value?", "answer": "A NULL value represents missing or unknown data, while a blank value represents an empty string or space." },
            { question: "What is an SQL JOIN?", "answer": "An SQL JOIN combines rows from two or more tables based on a related column between them." },
            { "question": "What is the INSERT INTO statement?", "answer": "The INSERT INTO statement is used to add new records into a table." },
            { "question": "What is the UPDATE statement?", "answer": "The UPDATE statement modifies existing records in a table." },
            { "question": "What is the DELETE statement?", "answer": "The DELETE statement removes one or more records from a table." },
            { "question": "What is the DISTINCT keyword?", "answer": "The DISTINCT keyword is used to return only unique values from a column, excluding duplicates." },
            { "question": "What is an index in SQL?", "answer": "An index is a performance optimization feature in SQL that allows faster retrieval of records from a table." }
        ],
        "Create Database in SQL": [
            { question: "What is the CREATE DATABASE command?", answer: "The CREATE DATABASE command is used to create a new database in SQL." },
            { question: "How do you create a database?", answer: "You can create a database by using the SQL command: CREATE DATABASE database_name;" },
            { "question": "What is the syntax for creating a database with a specific character set?", "answer": "To create a database with a specific character set, use: CREATE DATABASE database_name CHARACTER SET utf8;" },
            { "question": "Can you specify a collation when creating a database?", "answer": "Yes, you can specify a collation using the syntax: CREATE DATABASE database_name COLLATE collation_name;" },
            { "question": "What are the default settings when creating a database?", "answer": "When creating a database without specifying a character set or collation, SQL uses the system's default settings." },
            { "question": "How do you create a database with multiple filegroups?", "answer": "In SQL Server, you can create a database with multiple filegroups using: CREATE DATABASE database_name ON PRIMARY (name = 'filegroup1', filename = 'path'), FILEGROUP 'fg2';" },
            { "question": "What happens if the database already exists when using CREATE DATABASE?", "answer": "If the database already exists, SQL will throw an error unless you use the IF NOT EXISTS clause: CREATE DATABASE IF NOT EXISTS database_name;" },
            { "question": "How can you check if a database has been successfully created?", "answer": "You can check the list of databases using the command: SHOW DATABASES; to verify if the new database has been created." },
            { "question": "What permissions are required to create a database?", "answer": "To create a database, you need the CREATE DATABASE privilege or higher permissions like root or admin access." },
            { "question": "How do you delete or drop a database?", "answer": "To delete a database, use the command: DROP DATABASE database_name; Be cautious, as this action is irreversible." },
            { "question": "Can you rename a database after creating it?", "answer": "SQL doesn't provide a direct RENAME DATABASE command, but you can create a new database and copy the data or use backup and restore methods to achieve this." },
            { "question": "How do you back up a newly created database?", "answer": "You can back up a database using commands like mysqldump in MySQL: mysqldump -u username -p database_name > backup_file.sql;" }
                    
            
        ],
        "Tables in SQL": [
            { "question": "What is a table in SQL?", "answer": "A table is a collection of related data, organized into rows and columns." },
            { "question": "How are tables created in SQL?", "answer": "Tables are created using the CREATE TABLE command followed by the column definitions." },
            { "question": "What is a row in an SQL table?", "answer": "A row (or record) in a table represents a single, structured data item that contains values for each column." },
            { "question": "What is a column in an SQL table?", "answer": "A column (or field) defines the type of data that can be stored in a particular location for every row, like a field in a spreadsheet." },
            { "question": "What is the syntax for creating a table in SQL?", "answer": "The syntax for creating a table is: CREATE TABLE table_name (column1 datatype, column2 datatype, ...);" },
            { "question": "What are the common data types used in table columns?", "answer": "Common data types include INT, VARCHAR, DATE, FLOAT, BOOLEAN, and TEXT, among others." },
            { "question": "How do you define a primary key for a table?", "answer": "A primary key is defined within the CREATE TABLE statement by adding PRIMARY KEY (column_name) to ensure each row is uniquely identified." },
            { "question": "How can you add constraints to a table?", "answer": "Constraints like UNIQUE, NOT NULL, FOREIGN KEY, and CHECK can be added when defining columns within the CREATE TABLE statement." },
            { "question": "How do you insert data into a table?", "answer": "Data is inserted using the INSERT INTO statement, followed by the table name and the values for each column: INSERT INTO table_name (column1, column2) VALUES (value1, value2);" },
            { "question": "How do you retrieve data from a table?", "answer": "Data can be retrieved from a table using the SELECT statement: SELECT * FROM table_name; retrieves all columns and rows from the table." },
            { "question": "What is a temporary table in SQL?", "answer": "A temporary table is created using CREATE TEMPORARY TABLE, and it exists only for the duration of the database session or transaction." },
            { "question": "How do you drop a table in SQL?", "answer": "A table can be deleted using the DROP TABLE table_name; command, which removes both the table and its data permanently." }
        ]

    };

    const availableTopics = Object.keys(cardContent); // Extract the topic names from cardContent

    // Handle topic selection
    const handleTopicChange = (event) => {
        const topic = event.target.value;
        setChosenTopic(topic);
        setCurrentCardIndex(0); // Start from the first flashcard
        setCardFlipped(false); // Reset flip state
    };

    // Move to the next flashcard
    const handleNextCard = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cardContent[chosenTopic].length);
        setCardFlipped(false); // Reset flip state when moving to the next card
    };

    // Flip the flashcard
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
    const Dashboard =() =>{
        navigate('/student-dashboard');
    }

    const FlashcardHeader = () => (
        <div className="flashcard-header">
            <div className="flashcard-brand">
                <FontAwesomeIcon icon={faTachometerAlt} className="flashcard-icon" />
                <span className="flashcard-name">AutoAssess</span>
            </div>
            <div className="flashcard-header-icons">
                <FontAwesomeIcon icon={faCog} className="flashcard-header-icon" />
                <FontAwesomeIcon icon={faSignOutAlt} className="flashcard-header-icon" />
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
            <a href="#" onClick={handleUpcomingTestClick} >
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
                        <label>Select a Concept:</label>
                        <select value={chosenTopic} onChange={handleTopicChange}>
                            <option value="">-- Choose a Topic --</option>
                            {availableTopics.map((topic, index) => (
                                <option key={index} value={topic}>{topic}</option>
                            ))}
                        </select>
                    </div>

                    {chosenTopic && (
                        <div className="flashcard-wrapper">
                            <div className={`flashcard-box ${cardFlipped ? 'flipped' : ''}`} onClick={handleCardFlip}>
                                <div className="flashcard-front">
                                    <h3>{cardContent[chosenTopic][currentCardIndex].question}</h3>
                                </div>
                                <div className="flashcard-back">
                                    <h3>{cardContent[chosenTopic][currentCardIndex].answer}</h3>
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
