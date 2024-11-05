import React, { useState } from 'react';
import axios from 'axios';
import './MultipleDatasets.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faCog, faSignOutAlt, faUsers, faList, faClipboardList, faBookOpen, faChartBar, faMedal } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MultipleDatasetsPage = () => {
  const [files, setFiles] = useState([]);
  const [generatedSchema, setGeneratedSchema] = useState("");
  const [keyInfo, setKeyInfo] = useState({
    "Candidate Key": "None found",
    "Primary Key": "None found",
    "Foreign Key": "None found",
    "Composite Key": "None found"
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [addedCustomQuestions, setAddedCustomQuestions] = useState([]);
  const [marksForQuestions, setMarksForQuestions] = useState([]);
  const [marksForCustomQuestions, setMarksForCustomQuestions] = useState([]);
  const [newTestName, setNewTestName] = useState("");
  const [duration, setDuration] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [selectedTestQuestions, setSelectedTestQuestions] = useState([]);
  const [numEasy, setNumEasy] = useState(5);
  const [numMedium, setNumMedium] = useState(5);
  const [numHard, setNumHard] = useState(5);
  const [scheduledDate, setScheduledDate] = useState(new Date());

  const navigate = useNavigate();

  // Function to format schema
  const formatSchema = (schema) => {
    let formattedSchema = "";
    for (const [tableName, createStatement] of Object.entries(schema)) {
      formattedSchema += `Table: ${tableName}\n`;
      formattedSchema += createStatement
        .replace(/\\n/g, '\n') // Replace all occurrences of "\n" with a new line
        .replace(/\s+/g, ' ') // Remove extra whitespace between words
        .replace(/\(\s+/g, '(\n  ') // Add indentation after opening parenthesis
        .replace(/,\s+/g, ',\n  ') // Add new line and indentation after commas
        .replace(/\)\s*;/, '\n);') // Format closing parenthesis and semicolon
        .trim() + '\n\n'; // Trim and add spacing between tables
    }
    return formattedSchema;
  };

  // Handle file selection
  const onFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Upload files and extract schema and keys
  const onFilesUpload = async () => {
    if (files.length === 0) {
      alert("Please select at least one file!");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("num_easy", numEasy);
    formData.append("num_medium", numMedium);
    formData.append("num_hard", numHard);

    try {
      setLoadingState(true);
      setErrorState(null);

      const response = await axios.post("http://127.0.0.1:5000/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const formattedSchema = formatSchema(response.data.tables);
      setGeneratedSchema(formattedSchema);

      const keys = response.data.key_info;
      setKeyInfo({
        "Candidate Key": keys.CandidateKey || "None found",
        "Primary Key": keys.PrimaryKey || "None found",
        "Foreign Key": keys.ForeignKey || "None found",
        "Composite Key": keys.CompositeKey || "None found"
      });

      // Split and format the questions
      const lines = response.data.questions.split('\n');
      const questions = [];
      let currentDifficulty = null;

      lines.forEach((line) => {
        if (line.toLowerCase().includes("easy questions")) {
          currentDifficulty = "easy";
        } else if (line.toLowerCase().includes("medium questions")) {
          currentDifficulty = "medium";
        } else if (line.toLowerCase().includes("hard questions")) {
          currentDifficulty = "hard";
        } else if (line.trim()) {
          questions.push({
            text: line.trim(),
            isQuestion: /^\d+\./.test(line),
            marks: 1, // Default marks for questions
            difficulty: currentDifficulty,
          });
        }
      });

      setGeneratedQuestions(questions);
      setMarksForQuestions(questions.map(() => 1));
      setLoadingState(false);
    } catch (error) {
      console.error("Error uploading the files:", error);
      setErrorState("An error occurred while uploading the files. Please check the backend logs for more details.");
      setLoadingState(false);
    }
  };

  // Handle key info input changes
  const handleKeyChange = (keyType, newValue) => {
    setKeyInfo((prevKeyInfo) => ({
      ...prevKeyInfo,
      [keyType]: newValue
    }));
  };

  // Generate questions based on schema and key info
  const generateQuestions = async () => {
    try {
      setLoadingState(true);
      setErrorState(null);

      const response = await axios.post("http://127.0.0.1:5000/generate-questions", {
        tables: generatedSchema,
        key_info: keyInfo,
        num_easy: numEasy,
        num_medium: numMedium,
        num_hard: numHard,
      });

      const lines = response.data.questions.split('\n');
      const questions = [];
      let currentDifficulty = null;

      lines.forEach((line) => {
        if (line.toLowerCase().includes("easy questions")) {
          currentDifficulty = "easy";
        } else if (line.toLowerCase().includes("medium questions")) {
          currentDifficulty = "medium";
        } else if (line.toLowerCase().includes("hard questions")) {
          currentDifficulty = "hard";
        } else if (line.trim()) {
          questions.push({
            text: line.trim(),
            isQuestion: /^\d+\./.test(line),
            marks: 1, // Default marks for questions
            difficulty: currentDifficulty,
          });
        }
      });

      setGeneratedQuestions(questions);
      setMarksForQuestions(questions.map(() => 1));
      setLoadingState(false);
    } catch (error) {
      console.error("Error generating questions:", error);
      setErrorState("An error occurred while generating questions. Please try again.");
      setLoadingState(false);
    }
  };

  // Functions for managing questions and test creation
  const updateMarks = (index, value) => {
    const updatedMarks = [...marksForQuestions];
    updatedMarks[index] = Number(value) || 1;
    setMarksForQuestions(updatedMarks);
  };

  const updateCustomQuestionMarks = (index, value) => {
    const updatedMarks = [...marksForCustomQuestions];
    updatedMarks[index] = Number(value) || 1;
    setMarksForCustomQuestions(updatedMarks);
  };

  const toggleSelectedQuestion = (questionText) => {
    setSelectedTestQuestions((prevSelected) =>
      prevSelected.includes(questionText)
        ? prevSelected.filter(q => q !== questionText)
        : [...prevSelected, questionText]
    );
  };

  const onCustomQuestionChange = (e, index) => {
    const updatedCustomQuestions = [...addedCustomQuestions];
    updatedCustomQuestions[index] = e.target.value;
    setAddedCustomQuestions(updatedCustomQuestions);
  };

  const addNewCustomQuestion = () => {
    setAddedCustomQuestions([...addedCustomQuestions, ""]);
    setMarksForCustomQuestions([...marksForCustomQuestions, 1]);
  };

  // Separate questions by difficulty
  const easyQuestions = generatedQuestions.filter(q => q.difficulty === "easy" && q.isQuestion);
  const mediumQuestions = generatedQuestions.filter(q => q.difficulty === "medium" && q.isQuestion);
  const hardQuestions = generatedQuestions.filter(q => q.difficulty === "hard" && q.isQuestion);

  // Submit the test to the backend
  const onSubmitTest = async () => {
    if (!newTestName) {
      alert("Please enter a test name!");
      return;
    }

    if (!duration || isNaN(duration) || duration <= 0) {
      alert("Please enter a valid duration in minutes!");
      return;
    }

    // Prepare the selected and custom questions for submission
    const allTestQuestions = generatedQuestions
    .filter(q => q.isQuestion && selectedTestQuestions.includes(q.text) && q.text.trim() !== "")
    .map((q, index) => ({
      questionText: q.text,
      marks: marksForQuestions[index],
      questionNumber: index + 1
    }));

  const customQuestions = addedCustomQuestions
    .filter(q => q.trim() !== "") // Remove empty custom questions
    .map((q, index) => ({
      questionText: q,
      marks: marksForCustomQuestions[index],
      questionNumber: allTestQuestions.length + index + 1
    }));

    const testPayload = {
      testName: newTestName,
      date: new Date(),
      schema: generatedSchema,
      keyInfo: keyInfo,
      questions: [...allTestQuestions, ...customQuestions],
      duration: parseInt(duration),
      scheduledDate: scheduledDate,
    };

    try {
      // Send the test payload to the backend
      const response = await axios.post('http://localhost:3002/api/test/createTest', testPayload);
      const testId = response.data.testId;

      // Generate answers for the test
      await axios.post(`http://localhost:5000/generate-answers/${testId}`);

      alert('Test created and answers generated successfully!');
    } catch (error) {
      console.error('Error creating test or generating answers:', error);
      alert('Failed to create the test or generate answers.');
    }
  };

  // Handle logout and navigation
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
  const CreateTestPage = () => {
    navigate('/create-test');
  };


  return (
    <div className="md-dashboard-page">
      <div className="md-header-container">
        <div className="md-brand-logo" onClick={handleDashboardRedirect}>
          <FontAwesomeIcon icon={faTachometerAlt} className="md-brand-icon" />
          <span className="md-brand-name">AutoAssess</span>
        </div>
        <div className="md-header-icons">
          <FontAwesomeIcon icon={faCog} className="md-header-icon" />
          <FontAwesomeIcon icon={faSignOutAlt} className="md-header-icon" onClick={handleLogoutClick} />
        </div>
      </div>

      <div className="md-dashboard-container">
      <div className="teacher-sidebar">
      <div className="teacher-branding">
            <FontAwesomeIcon icon={faTachometerAlt} className="teacher-brand-icon" />
            <span className="teacher-brand-name">AutoAssess</span>
        </div>

        <a onClick={handleDashboardRedirect}>
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
        </a>
        <a onClick={CreateTestPage}>
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


        <div className="md-main-content">
          <div className="md-create-test-container">
            <div className="md-left-pane">
              <h3>Generated SQL Schema:</h3>
              <pre className="md-schema-display">{generatedSchema}</pre>

              <h3>Key Information:</h3>
              <div className="key-section">
                <h4>Primary Key:</h4>
                <input
                  type="text"
                  value={keyInfo["Primary Key"]}
                  onChange={(e) => handleKeyChange("Primary Key", e.target.value)}
                  className="md-input-field"
                />
              </div>
              <div className="key-section">
                <h4>Foreign Key:</h4>
                <input
                  type="text"
                  value={keyInfo["Foreign Key"]}
                  onChange={(e) => handleKeyChange("Foreign Key", e.target.value)}
                  className="md-input-field"
                />
              </div>
              

              <h3>Generated Questions:</h3>
              <h4>Easy Questions</h4>
              <ul className="md-questions-list">
                {easyQuestions.map((question, index) => (
                  <li key={index} className="md-question">
                    <input
                      type="checkbox"
                      checked={selectedTestQuestions.includes(question.text)}
                      onChange={() => toggleSelectedQuestion(question.text)}
                    />
                    {question.text}
                    <input
                      type="number"
                      value={marksForQuestions[index] || 1}
                      onChange={(e) => updateMarks(index, e.target.value)}
                      className="md-marks-input"
                      min="1"
                      placeholder="Marks"
                    />
                  </li>
                ))}
              </ul>

              <h4>Medium Questions</h4>
              <ul className="md-questions-list">
                {mediumQuestions.map((question, index) => (
                  <li key={index + easyQuestions.length} className="md-question">
                    <input
                      type="checkbox"
                      checked={selectedTestQuestions.includes(question.text)}
                      onChange={() => toggleSelectedQuestion(question.text)}
                    />
                    {question.text}
                    <input
                      type="number"
                      value={marksForQuestions[index + easyQuestions.length] || 1}
                      onChange={(e) => updateMarks(index + easyQuestions.length, e.target.value)}
                      className="md-marks-input"
                      min="1"
                      placeholder="Marks"
                    />
                  </li>
                ))}
              </ul>

              <h4>Hard Questions</h4>
              <ul className="md-questions-list">
                {hardQuestions.map((question, index) => (
                  <li key={index + easyQuestions.length + mediumQuestions.length} className="md-question">
                    <input
                      type="checkbox"
                      checked={selectedTestQuestions.includes(question.text)}
                      onChange={() => toggleSelectedQuestion(question.text)}
                    />
                    {question.text}
                    <input
                      type="number"
                      value={marksForQuestions[index + easyQuestions.length + mediumQuestions.length] || 1}
                      onChange={(e) => updateMarks(index + easyQuestions.length + mediumQuestions.length, e.target.value)}
                      className="md-marks-input"
                      min="1"
                      placeholder="Marks"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="md-right-pane">
              <h2>Create Test</h2>
              <label className="md-label">Test Name:</label>
              <input
                type="text"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                className="md-input-field"
                placeholder="Enter test name"
              />

              <label className="md-label">Test Duration (minutes):</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="md-input-field"
                min="1"
                placeholder="Enter duration"
              />

              <h3>Schedule Test</h3>
              <label className="md-label">Select Date and Time:</label>
              <DatePicker
                selected={scheduledDate}
                onChange={(date) => setScheduledDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="md-input-field"
              />

              <h3>Specify Number of Questions</h3>
              <label className="md-label">Easy:</label>
              <input
                type="number"
                value={numEasy}
                onChange={(e) => setNumEasy(e.target.value)}
                className="md-input-field"
                min="0"
              />

              <label className="md-label">Medium:</label>
              <input
                type="number"
                value={numMedium}
                onChange={(e) => setNumMedium(e.target.value)}
                className="md-input-field"
                min="0"
              />

              <label className="md-label">Hard:</label>
              <input
                type="number"
                value={numHard}
                onChange={(e) => setNumHard(e.target.value)}
                className="md-input-field"
                min="0"
              />

              <h3>Upload Dataset:</h3>
              <input type="file" multiple onChange={onFilesChange} className="md-file-input" />
              <button onClick={onFilesUpload} className="md-button">Upload Datasets</button>

              <br /><br />
              <button onClick={generateQuestions} className="md-button md-generate-btn">Generate Questions</button>

              <h3>Custom Questions</h3>
              {addedCustomQuestions.map((customQuestion, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => onCustomQuestionChange(e, index)}
                    placeholder="Enter custom question"
                    className="md-input-field"
                  />
                  <input
                    type="number"
                    value={marksForCustomQuestions[index] || 1}
                    onChange={(e) => updateCustomQuestionMarks(index, e.target.value)}
                    className="md-marks-input"
                    min="1"
                    placeholder="Marks"
                  />
                </div>
              ))}
              <button onClick={addNewCustomQuestion} className="md-button">Add Custom Question</button>

              <br /><br />
              <button onClick={onSubmitTest} className="md-button md-submit-btn">Submit Test</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleDatasetsPage;
