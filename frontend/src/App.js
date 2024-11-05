import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Signup from './components/Signup';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPerformances from './components/StudentPerformances';
import CreateTest from './components/Createtest';
import UpcomingTest from './components/UpcomingTest';
import TestDetails from './components/TestDetail';
import TakeTest from './components/TakeTest';
import ClassLeaderboard from './components/ClassLeaderboard';
import FlashcardPage from './components/FlashcardPage';
import TestSubmitted from './components/Testsubmitted';
import Score from './components/Score';
import TestResult from './components/ResultPage'
import SingleDatasetTestPage from './components/SingleDatasetTestPage'; // New component for single dataset
import MultipleDatasetsTestPage from './components/MultipleDatasetsTestPage'; // New component for multiple datasets

function App() {
 
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-dashboard" element={<StudentDashboard/> }/>
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      <Route path="/student-performances" element={<StudentPerformances />} />
      <Route path="/create-test" element={<CreateTest />} />
      <Route path="/create-test/single-dataset" element={<SingleDatasetTestPage />} />
      <Route path="/create-test/multiple-datasets" element={<MultipleDatasetsTestPage />} />
      <Route path="/upcoming-tests" element={<UpcomingTest />} />
      <Route path="/test-details/:testId" element={<TestDetails />} />
      <Route path="/take-test/:testId" element={<TakeTest />} />
      <Route path="/class-leaderboard" element={<ClassLeaderboard/>}/>
      <Route path="/flashcards" element={<FlashcardPage />} />
      <Route path="/test-submitted" element={<TestSubmitted />} />
      <Route path="/score" element={<Score />} />
      <Route path="/test-result/:testId/:studentId"  element={<TestResult />} />

    </Routes>
  );
}

export default App;
