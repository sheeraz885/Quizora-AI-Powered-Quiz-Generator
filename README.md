# Quizora AI — AI-Powered Quiz Generator

Quizora AI is a full-stack web application that uses Google Gemini AI to generate personalized multiple-choice quizzes based on a user's chosen topic, difficulty level, and preferences. Users can take quizzes, track their performance, review answers with explanations, and access their quiz history through a clean, responsive interface.

> **Project Status:** Local Development  
> **Live Demo:** Not deployed yet

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

---

## Overview

Quizora AI simplifies quiz creation by using artificial intelligence to generate questions on a wide range of topics. Users can enter a topic, select a difficulty level, customize their preferences, and generate a quiz with the help of Google Gemini AI.

The application combines a React and TypeScript frontend, a Node.js and Express backend, MongoDB for data storage, and Google's Gemini AI for question generation.

Quizora AI is designed for students, self-learners, and anyone who wants to practice a subject, review their knowledge, and monitor their learning progress.

## Screenshots

The following screenshots demonstrate the main pages and features of Quizora AI.

### 1. Login Page

![Quizora AI Login Page](Docs/Screen%20Shots/login.png)

### 2. Registration Page

![Quizora AI Registration Page](Docs/Screen%20Shots/register.png)

### 3. Dashboard

![Quizora AI Dashboard](Docs/Screen%20Shots/dashboard.png)

### 4. Quiz Generation

![Quiz Generation](Docs/Screen%20Shots/quiz-generation.png)

### 5. Taking a Quiz

![Taking a Quiz](Docs/Screen%20Shots/take-quiz.png)

### 6. Quiz Results and Score

![Quiz Results and Score](Docs/Screen%20Shots/quiz-results.png)

### 7. Answer Review and Explanations

![Answer Review and Explanations](Docs/Screen%20Shots/answer-review.png)

### 8. Quiz History

![Quiz History](Docs/Screen%20Shots/quiz-history.png)

### 9. User Profile

![User Profile](Docs/Screen%20Shots/profile.png)

---

## Features

### AI-Powered Quiz Generation

- Generate multiple-choice quizzes using Google Gemini AI.
- Enter a custom topic to personalize each quiz.
- Choose from Easy, Medium, and Hard difficulty levels.
- Select the number of questions according to available options.
- Provide additional instructions to customize generated quizzes.

### Interactive Quiz Experience

- Answer questions through a dedicated quiz interface.
- Navigate through questions and select answers.
- Submit answers for evaluation.
- View the final score and percentage after completing a quiz.

### Results and Answer Review

- Review submitted answers after completing a quiz.
- Compare selected answers with correct answers.
- Read explanations for individual questions.
- Identify topics that need further practice.

### Dashboard and Analytics

- View quiz performance statistics.
- Track quiz attempts and scores.
- Review recent quiz activity.
- Monitor learning progress through available dashboard information.

### Quiz History

- Access previously completed quizzes.
- Revisit past results and answer reviews.
- Delete quiz attempts from history, if supported by the application.

### User Authentication

- Register an account and log in.
- Access protected pages after authentication.
- Manage user profile information.
- Maintain authenticated sessions using the application's configured authentication system.

### Responsive User Interface

- Modern interface built with React and Tailwind CSS.
- Dedicated pages for authentication, dashboard, quiz generation, results, history, and profile.
- Loading states and user feedback.
- Responsive layouts for different screen sizes.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Build Tool | Vite |
| Routing | React Router |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Artificial Intelligence | Google Gemini AI |
| AI SDK | `@google/genai` |
| Authentication | JSON Web Tokens (JWT), if configured |
| Password Security | bcryptjs, if configured |
| Version Control | Git, GitHub |

---

## Project Structure

The following is an example structure for the project. Update it to match your actual repository files and folder names.

```text
Quizora-AI-Powered-Quiz-Generator/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── Docs/
│   └── Screen Shots/
│       ├── login.png
│       ├── register.png
│       ├── dashboard.png
│       ├── quiz-generation.png
│       ├── take-quiz.png
│       ├── quiz-results.png
│       ├── answer-review.png
│       ├── quiz-history.png
│       └── profile.png
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .gitignore
├── package.json
├── index.html
└── README.md
```

---

## Getting Started

Follow these instructions to run Quizora AI on your local machine.

### Prerequisites

Make sure you have the following:

- [Node.js](https://nodejs.org/) and npm
- [Git](https://git-scm.com/)
- A MongoDB Atlas cluster or another compatible MongoDB database
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/sheeraz885/Quizora-AI-Powered-Quiz-Generator.git
cd Quizora-AI-Powered-Quiz-Generator
```

### 2. Configure the Backend

Open a terminal in the project root:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder. If `.env.example` exists, copy it using PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and add your actual environment variable values. Refer to the Environment Variables section below.

Start the backend using the script configured in your backend `package.json`. For example, if a `dev` script exists:

```bash
npm run dev
```

The backend is expected to run on port `5000` if that is the port configured in your project.

If your application provides a health endpoint, you can test it at:

`http://localhost:5000/health`

### 3. Configure the Frontend

Keep the backend running and open a **second terminal** in the project root.

Install the frontend dependencies:

```bash
npm install
```

Create the frontend `.env` file if your frontend uses environment variables. If the root `.env.example` contains the frontend configuration, copy it using:

```powershell
Copy-Item .env.example .env
```

Set the API URL according to your frontend configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

Make sure this variable name matches the one used by your frontend code.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite, normally:

`http://localhost:5173`

Keep both frontend and backend terminals running while using the application.

---

## Environment Variables

Environment variables store configuration values outside the source code.

### Backend — `backend/.env`

| Variable | Description |
|---|---|
| `PORT` | Port used by the Express server, commonly `5000`. |
| `NODE_ENV` | Application environment, such as `development` or `production`. |
| `MONGODB_URI` | MongoDB connection string. |
| `GEMINI_API_KEY` | API key used to access Google Gemini AI. |
| `JWT_SECRET` | Secret used to sign JWTs, if JWT authentication is implemented. |
| `CLIENT_URL` | Frontend origin allowed by CORS, commonly `http://localhost:5173`. |

Example configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Use only the variables your backend actually requires.

### Frontend — `.env`

If your frontend uses `VITE_API_URL`, configure it as follows:

```env
VITE_API_URL=http://localhost:5000/api
```

The variable name and URL must match the frontend's actual API configuration.

**Security warning:** Never commit real `.env` files, API keys, database credentials, or JWT secrets to GitHub. Keep placeholder values in `.env.example` instead of real credentials.

---

## API Endpoints

The following table describes example REST API routes for the application's main functionality. Confirm each endpoint against your backend route files before relying on this documentation.

### Authentication

| Method | Example Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user. |
| POST | `/api/auth/login` | Authenticate a user. |
| POST | `/api/auth/logout` | Log out a user, if implemented. |
| GET | `/api/auth/me` | Retrieve the authenticated user, if implemented. |

### Quiz Management

| Method | Example Endpoint | Description |
|---|---|---|
| POST | `/api/quizzes/generate` | Generate a quiz using Gemini AI. |
| GET | `/api/quizzes/:quizId` | Retrieve quiz information, if implemented. |
| POST | `/api/quizzes/:quizId/submit` | Submit quiz answers, if implemented. |
| GET | `/api/quizzes/history` | Retrieve quiz history, if implemented. |
| GET | `/api/quizzes/attempts/:attemptId` | Retrieve an attempt and its results, if implemented. |
| DELETE | `/api/quizzes/attempts/:attemptId` | Delete a quiz attempt, if implemented. |

### Dashboard

| Method | Example Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Retrieve dashboard statistics, if implemented. |

These are documentation examples, not a guarantee that every route exists. Keep only the endpoints implemented in your project.

---

## Security

The application may use the following security measures, depending on its current implementation:

- Password hashing before storing user passwords.
- Authentication to protect restricted routes and API resources.
- Server-side validation of submitted quiz answers.
- User-specific access controls for quiz records.
- Rate limiting to help control repeated API requests.
- CORS configuration to restrict permitted frontend origins.
- Environment variables to keep credentials out of source code.

Only describe security features as implemented when they are present in your code.

---

## Future Improvements

Possible improvements for future versions include:

- Deploy the frontend and backend so the application is accessible online.
- Add timed quizzes and additional question formats.
- Introduce topic-based performance charts and progress reports.
- Improve quiz customization and difficulty recommendations.
- Add automated tests for frontend components and backend APIs.
- Improve accessibility and interface customization.

---

## Author

**Sheeraz Ahmed**

Software Engineering Student | Aspiring Full-Stack Developer

- **GitHub:** [@sheeraz885](https://github.com/sheeraz885)
- **Portfolio:** [Personal Portfolio](https://personal-portfolio-rho-lyart-47.vercel.app/)

This project was developed as part of my full-stack web development learning journey.

---

## License

This project is currently a learning and portfolio project. No open-source license has been specified yet. If you intend to allow others to use, modify, or distribute the code, consider adding an appropriate `LICENSE` file.
