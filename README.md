# AutoAssess-Automated-Evaluation-Platform-for-Enhanced-SQL-learning


# 🎓 AutoAssess - Automated SQL Evaluation Platform

<div align="center">

![AutoAssess Banner](https://img.shields.io/badge/AutoAssess-SQL%20Learning%20Platform-blue?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Flask](https://img.shields.io/badge/Flask-Python-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![Llama 3](https://img.shields.io/badge/Llama%203-LLM-purple?style=flat-square)](https://ollama.ai/)

**An intelligent platform for automated SQL query evaluation using Large Language Models**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [Usage](#-usage) • [API Reference](#-api-reference)

</div>

---

## 📖 Overview

AutoAssess is a full-stack educational platform that leverages **Llama 3** LLM to automatically generate SQL questions based on Bloom's Taxonomy and evaluate student responses. The platform provides teachers with tools to create tests from dataset schemas and offers students an interactive learning environment with instant feedback.

### 🎯 Key Highlights

- **AI-Powered Question Generation**: Automatically generates SQL questions at varying difficulty levels (Easy, Medium, Hard) based on uploaded dataset schemas
- **Intelligent Answer Evaluation**: Uses Llama 3 to evaluate SQL queries for both logical and syntactical correctness
- **Bloom's Taxonomy Integration**: Questions aligned with cognitive learning levels (Remembering → Creating)
- **Real-time Grading**: Instant feedback on student submissions with detailed scoring

---

## ✨ Features

### For Teachers
- 📤 **Upload Datasets** - Upload CSV/Excel files to auto-generate table schemas
- 📝 **Auto-Generate Questions** - AI creates 15 questions (5 easy, 5 medium, 5 hard)
- 📊 **View Student Performance** - Track individual and class-wide progress
- 🏆 **Class Leaderboard** - Monitor top performers

### For Students
- 📚 **Take Tests** - Attempt SQL tests with an intuitive interface
- ✅ **Instant Grading** - Get immediate feedback on submissions
- 📈 **View Results** - Detailed breakdown of answers and scores
- 🃏 **Flashcards** - Study SQL concepts with interactive flashcards
- 🏅 **Leaderboard** - Compare performance with classmates

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────────┐│
│  │  Student  │ │  Teacher  │ │   Auth    │ │   Test Interface  ││
│  │ Dashboard │ │ Dashboard │ │  Pages    │ │   & Results       ││
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────────┬─────────┘│
└────────┼─────────────┼─────────────┼───────────────────┼─────────┘
         │             │             │                   │
         ▼             ▼             ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │   Auth   │ │   Test   │ │  Score   │ │    Leaderboard     │  │
│  │  Routes  │ │  Routes  │ │  Routes  │ │      Routes        │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┬─────────┘  │
└───────┼────────────┼────────────┼──────────────────┼────────────┘
        │            │            │                  │
        ▼            ▼            ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB Database                          │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│    │ Students │ │ Teachers │ │  Tests   │ │    Questions     │  │
│    └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LLM Service (Flask + Llama 3)                │
│  ┌────────────────┐ ┌────────────────┐ ┌──────────────────────┐ │
│  │    Question    │ │     Answer     │ │   Response Grading   │ │
│  │   Generation   │ │   Generation   │ │    & Evaluation      │ │
│  └────────────────┘ └────────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router, Chart.js, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **LLM Service** | Flask, LangChain, Ollama (Llama 3) |
| **Authentication** | JWT, bcryptjs |

---

## 📦 Installation

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB (local or Atlas)
- [Ollama](https://ollama.ai/) with Llama 3 model

### 1. Clone the Repository

```bash
git clone https://github.com/Arman-02/AutoAssess-Automated-Evaluation-Platform-for-Enhanced-SQL-learning.git
cd AutoAssess-Automated-Evaluation-Platform-for-Enhanced-SQL-learning
```

### 2. Install Ollama & Llama 3

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Llama 3 model
ollama pull llama3

# Start Ollama server
ollama serve
```

### 3. Setup Backend (Node.js Server)

```bash
cd server
npm install

# Create .env file
echo "PORT=3002" > .env
echo "MONGODB_URI=mongodb://127.0.0.1:27017/capstoneDB" >> .env
echo "JWT_SECRET=your_jwt_secret_here" >> .env

# Start server
node server.js
```

### 4. Setup LLM Service (Flask)

```bash
cd frontend
pip install flask flask-cors pandas pymongo langchain-community

# Start Flask server
python llm.py
```

### 5. Setup Frontend (React)

```bash
cd frontend
npm install
npm start
```

### 6. Start MongoDB

```bash
# If using local MongoDB
mongod --dbpath /path/to/data/db
```

---

## 🚀 Usage

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Node.js API | http://localhost:3002 |
| Flask LLM Service | http://localhost:5000 |

### Teacher Workflow

1. **Sign Up/Login** as a Teacher
2. **Create Test** → Upload a CSV/Excel dataset
3. **Auto-Generate Questions** → AI generates 15 SQL questions
4. **Publish Test** → Make available to students
5. **Grade Tests** → Review and finalize scores
6. **View Performance** → Analyze class results

### Student Workflow

1. **Sign Up/Login** as a Student
2. **View Upcoming Tests** → See available tests
3. **Take Test** → Write SQL queries for each question
4. **Submit** → Get instant AI-powered grading
5. **View Results** → See detailed feedback
6. **Check Leaderboard** → Compare with classmates

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |

### Tests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test` | Get all tests |
| POST | `/api/test/create` | Create new test |
| GET | `/api/test/:testId` | Get test details |

### LLM Endpoints (Flask)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload dataset & generate questions |
| POST | `/generate-answers/:test_id` | Generate correct answers |
| POST | `/grade-test/:test_id/:student_id` | Grade student submission |
| GET | `/graded-tests/:student_id` | Get student's graded tests |

---

## 📁 Project Structure

```
AutoAssess/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── TeacherDashboard.js
│   │   │   ├── CreateTest.js
│   │   │   ├── TakeTest.js
│   │   │   ├── ClassLeaderboard.js
│   │   │   └── ...
│   │   └── App.js
│   ├── llm.py              # Flask LLM service
│   └── package.json
│
├── server/
│   ├── models/
│   │   ├── student.js
│   │   ├── teacher.js
│   │   ├── test.js
│   │   └── Question.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── test.js
│   │   ├── score.js
│   │   ├── leaderboard.js
│   │   └── ...
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔮 Future Enhancements

- [ ] Support for more SQL dialects (PostgreSQL, MySQL syntax validation)
- [ ] Partial credit scoring based on query similarity
- [ ] Hint system using LLM explanations
- [ ] Practice mode with unlimited attempts
- [ ] Export results to PDF/CSV
- [ ] Integration with classroom management systems (Canvas, Moodle)

---

## 📄 Research Publication

This project was published in **IEEE (2025)**:

> **AutoAssess: Automated SQL Query Evaluation Using LLMs**
> 
> A novel approach to automated SQL assessment leveraging Large Language Models for intelligent question generation and answer evaluation.

---

## 👥 Authors
- **Ananya Joshi** - [GitHub](https://github.com/ananya1305) | [LinkedIn](https://www.linkedin.com/in/ananya-joshi-1268532b2/)
- **Mohommed Arman Motiwala** - [GitHub](https://github.com/Arman-02) | [LinkedIn](www.linkedin.com/in/arman-motiwala02)
- **Dr. Radhika Chapaneri** [LinkedIn](https://www.linkedin.com/in/radhikachapaneri/)
---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

</div>
