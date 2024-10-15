import React, { useState } from 'react';
import axios from 'axios';
import './CreateTest.css'; // Import the CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faTasks, faChartBar, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // For navigation

const CreateTestPage = () => {
  const [testFile, setTestFile] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [addedCustomQuestions, setAddedCustomQuestions] = useState([]);
  const [generatedSchema, setGeneratedSchema] = useState(""); // Store the generated schema
  const [newTestName, setNewTestName] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [selectedTestQuestions, setSelectedTestQuestions] = useState([]);
  const navigate = useNavigate();

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

    try {
      setLoadingState(true);
      setErrorState(null);

      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setGeneratedSchema(response.data.schema); // Set the generated schema

      if (typeof response.data.questions === 'string') {
        setGeneratedQuestions(response.data.questions.split('\n'));
      } else {
        setGeneratedQuestions(response.data.questions);
      }

      setLoadingState(false);
    } catch (error) {
      console.error("Error uploading the file:", error);
      setErrorState("An error occurred while uploading the file. Please check the backend logs for more details.");
      setLoadingState(false);
    }
  };

  const onCustomQuestionChange = (e, index) => {
    const updatedCustomQuestions = [...addedCustomQuestions];
    updatedCustomQuestions[index] = e.target.value;
    setAddedCustomQuestions(updatedCustomQuestions);
  };

  const addNewCustomQuestion = () => {
    setAddedCustomQuestions([...addedCustomQuestions, ""]);
  };

  const toggleSelectedQuestion = (question) => {
    setSelectedTestQuestions((prevSelected) =>
      prevSelected.includes(question)
        ? prevSelected.filter((q) => q !== question)
        : [...prevSelected, question]
    );
  };

  const isQuestionValid = (line) => {
    // Check if the line is a heading (e.g., begins with '*')
    return !line.trim().startsWith('*') && line.trim() !== '';
  };

  const onSubmitTest = async () => {
    if (!newTestName) {
      alert("Please enter a test name!");
      return;
    }

    const allTestQuestions = [
      ...selectedTestQuestions.map((q, index) => ({ questionText: q, marks: 1, questionNumber: index + 1 })),
      ...addedCustomQuestions.map((q, index) => ({ questionText: q, marks: 1, questionNumber: selectedTestQuestions.length + index + 1 }))
    ];

    const testPayload = {
      testName: newTestName,
      date: new Date(),
      schema: generatedSchema, // Include the generated schema in the payload
      questions: allTestQuestions
    };

    console.log("Test Payload:", testPayload); // Log the payload

    try {
      const response = await axios.post('http://localhost:3002/api/test/createTest', testPayload);
      
      const testId = response.data.testId; // Get the testId from the response

      // Call the answer generation API
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
        <div className="ct-sidebar">
          <a href="/teacher-dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
          </a>
          <a href="/create-test" className="ct-active">
            <FontAwesomeIcon icon={faTasks} /> Create Test
          </a>
          <a href="/student-performances">
            <FontAwesomeIcon icon={faChartBar} /> Student Performance
          </a>
          <a href="#">
            <FontAwesomeIcon icon={faCog} /> Settings
          </a>
        </div>

        <div className="ct-main-content">
          <div className="ct-create-test-container">
            <div className="ct-left-pane">
              <h3>Generated SQL Schema:</h3>
              <pre className="ct-schema-display">{generatedSchema}</pre>

              <h3>Generated Questions:</h3>
              <ul className="ct-questions-list">
                {generatedQuestions.map((question, index) => (
                  <li key={index}>
                    {isQuestionValid(question) ? (
                      <>
                        <input
                          type="checkbox"
                          checked={selectedTestQuestions.includes(question)}
                          onChange={() => toggleSelectedQuestion(question)}
                        />
                        {question}
                      </>
                    ) : (
                      <span className="ct-question-heading">{question}</span> // Display headings with better styles
                    )}
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

export default CreateTestPage;
