import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SingleDataset.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faCog, faSignOutAlt, faUsers, faList, faClipboardList, faBookOpen, faChartBar, faMedal } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SingleDatasetTestPage = () => {
  const [testFile, setTestFile] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [addedCustomQuestions, setAddedCustomQuestions] = useState([]);
  const [marksForQuestions, setMarksForQuestions] = useState([]);
  const [marksForCustomQuestions, setMarksForCustomQuestions] = useState([]);
  const [generatedSchema, setGeneratedSchema] = useState("");
  const [newTestName, setNewTestName] = useState("");
  const [duration, setDuration] = useState(""); // State for test duration
  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [selectedTestQuestions, setSelectedTestQuestions] = useState([]);
  const [numEasy, setNumEasy] = useState(5);
  const [numMedium, setNumMedium] = useState(5);
  const [numHard, setNumHard] = useState(5);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    if (generatedQuestions.length > 0) {
      const questionCount = generatedQuestions.filter(q => q.isQuestion).length;
      setMarksForQuestions(new Array(questionCount).fill(1)); // Initialize with the correct number of questions
    }
  }, [generatedQuestions]);

  const onTestFileChange = (e) => {
    setTestFile(e.target.files[0]);
  };

  const onTestFileUpload = async () => {
    if (!testFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", testFile);
    formData.append("num_easy", numEasy);
    formData.append("num_medium", numMedium);
    formData.append("num_hard", numHard);

    try {
      setLoadingState(true);
      setErrorState(null);

      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setGeneratedSchema(response.data.schema);

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
            isQuestion: line.match(/^\d+\./) !== null,
            marks: 1, // Default marks for questions
            difficulty: currentDifficulty,
          });
        }
      });

      setGeneratedQuestions(questions);
      setMarksForQuestions(questions.map(() => 1));
      setLoadingState(false);
    } catch (error) {
      console.error("Error uploading the file:", error);
      setErrorState("An error occurred while uploading the file. Please check the backend logs for more details.");
      setLoadingState(false);
    }
  };

  const updateMarks = (index, value) => {
    const updatedMarks = [...marksForQuestions];
    updatedMarks[index] = parseInt(value, 10) || 1;
    setMarksForQuestions(updatedMarks);
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

  const updateCustomQuestionMarks = (index, value) => {
    const updatedMarks = [...marksForCustomQuestions];
    updatedMarks[index] = parseInt(value, 10) || 1;
    setMarksForCustomQuestions(updatedMarks);
  };

  const onSubmitTest = async () => {
    if (!newTestName) {
      alert("Please enter a test name!");
      return;
    }

    if (!duration || isNaN(duration) || duration <= 0) {
      alert("Please enter a valid duration in minutes!");
      return;
    }

    const allTestQuestions = generatedQuestions
      .filter(q => q.isQuestion && selectedTestQuestions.includes(q.text))
      .map((q, index) => ({
        questionText: q.text,
        marks: marksForQuestions[index],
        questionNumber: index + 1
      }));

    const customQuestions = addedCustomQuestions.map((q, index) => ({
      questionText: q,
      marks: marksForCustomQuestions[index],
      questionNumber: allTestQuestions.length + index + 1
    }));

    const testPayload = {
      testName: newTestName,
      date: new Date(),
      schema: generatedSchema,
      questions: [...allTestQuestions, ...customQuestions],
      scheduledDate: scheduledDate,
      duration: parseInt(duration)
    };

    try {
      const response = await axios.post('http://localhost:3002/api/test/createTest', testPayload);
      const testId = response.data.testId;
      await axios.post(`http://localhost:5000/generate-answers/${testId}`);
      alert('Test created and answers generated successfully!');
    } catch (error) {
      console.error('Error creating test or generating answers:', error);
      alert('Failed to create the test or generate answers.');
    }
  };

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

  // Separate questions by difficulty
  const easyQuestions = generatedQuestions.filter(q => q.difficulty === "easy" && q.isQuestion);
  const mediumQuestions = generatedQuestions.filter(q => q.difficulty === "medium" && q.isQuestion);
  const hardQuestions = generatedQuestions.filter(q => q.difficulty === "hard" && q.isQuestion);

  return (
    <div className="ct-dashboard-page">
      <div className="ct-header-container">
        <div className="ct-brand-logo" onClick={handleDashboardRedirect}>
          <FontAwesomeIcon icon={faTachometerAlt} className="ct-brand-icon" />
          <span className="ct-brand-name">AutoAssess</span>
        </div>
        <div className="ct-header-icons">
          <FontAwesomeIcon icon={faCog} className="ct-header-icon" />
          <FontAwesomeIcon icon={faSignOutAlt} className="ct-header-icon" onClick={handleLogoutClick} />
        </div>
      </div>

      <div className="ct-dashboard-container">
      <div className="teacher-sidebar">
      <div className="teacher-branding">
            <FontAwesomeIcon icon={faTachometerAlt} className="teacher-brand-icon" />
            <span className="teacher-brand-name">AutoAssess</span>
        </div>

        <a href={'./teacher-dashboard'}>
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

        <div className="ct-main-content">
          <div className="ct-create-test-container">
            <div className="ct-left-pane">
              <h3>Generated SQL Schema:</h3>
              <pre className="ct-schema-display">{generatedSchema}</pre>

              <h3>Generated Questions:</h3>
              <ul className="ct-questions-list">
                <h4>Easy Questions</h4>
                {easyQuestions.map((question, index) => (
                  <li key={index} className="ct-question">
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
                      className="ct-marks-input"
                      min="1"
                      step="1"
                      placeholder="Marks"
                    />
                  </li>
                ))}

                <h4>Medium Questions</h4>
                {mediumQuestions.map((question, index) => (
                  <li key={index + easyQuestions.length} className="ct-question">
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
                      className="ct-marks-input"
                      min="1"
                      step="1"
                      placeholder="Marks"
                    />
                  </li>
                ))}

                <h4>Hard Questions</h4>
                {hardQuestions.map((question, index) => (
                  <li key={index + easyQuestions.length + mediumQuestions.length} className="ct-question">
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
                      className="ct-marks-input"
                      min="1"
                      step="1"
                      placeholder="Marks"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="ct-right-pane">
              <h2>Create Test</h2>
              <label className="ct-label">Test Name:</label>
              <input
                type="text"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="Enter test name"
                className="ct-input-field"
              />

              <label className="ct-label">Test Duration (minutes):</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter test duration"
                className="ct-input-field"
                min="1"
              />

              <h3>Schedule Test</h3>
              <label className="ct-label">Select Date and Time:</label>
              <DatePicker
                selected={scheduledDate}
                onChange={(date) => setScheduledDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="ct-input-field"
              />

              <h3>Specify Number of Questions</h3>
              <label className="ct-label">Easy:</label>
              <input
                type="number"
                value={numEasy}
                onChange={(e) => setNumEasy(e.target.value)}
                className="ct-input-field"
                min="0"
              />

              <label className="ct-label">Medium:</label>
              <input
                type="number"
                value={numMedium}
                onChange={(e) => setNumMedium(e.target.value)}
                className="ct-input-field"
                min="0"
              />

              <label className="ct-label">Hard:</label>
              <input
                type="number"
                value={numHard}
                onChange={(e) => setNumHard(e.target.value)}
                className="ct-input-field"
                min="0"
              />

              <h3>Upload Dataset:</h3>
              <input type="file" onChange={onTestFileChange} className="ct-file-input" />
              <button onClick={onTestFileUpload} className="ct-button">Upload Dataset</button>

              {loadingState && <p>Loading...</p>}

              <h3>Custom Questions</h3>
              {addedCustomQuestions.map((customQuestion, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => onCustomQuestionChange(e, index)}
                    placeholder="Enter custom question"
                    className="ct-input-field"
                  />
                  <input
                    type="number"
                    value={marksForCustomQuestions[index]}
                    onChange={(e) => updateCustomQuestionMarks(index, e.target.value)}
                    className="ct-marks-input"
                    min="0"
                    placeholder="Marks"
                  />
                </div>
              ))}
              <button onClick={addNewCustomQuestion} className="ct-button">Add Custom Question</button>

              <br /><br />
              <button onClick={onSubmitTest} className="ct-button ct-submit-btn">Submit Test</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleDatasetTestPage;
