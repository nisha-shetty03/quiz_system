# 🎯 Quiz System

An online quiz management system featuring **separate Admin and Student portals**. Administrators can create timed assessments with multiple question types and provide detailed explanations. Students can attempt quizzes, receive instant results, view leaderboard rankings, and track performance analytics in real time.

🌐 **Live Demo:** [quiz-system-livid.vercel.app](https://quiz-system-livid.vercel.app)

---

## ✨ Features

### 👩‍💼 Admin Portal
- Create and manage quizzes with customizable time limits
- Add questions in three formats:
  - **Multiple Choice (MCQ)**
  - **True / False**
  - **Short Answer**
- Provide detailed explanations for each question
- View all registered users and their roles

### 🎓 Student Portal
- Browse and attempt available quizzes
- Timed quiz sessions with auto-submission
- Instant results upon completion
- View correct answers with explanations
- **Leaderboard** — compare scores with other students
- **Performance analytics** — track scores over time

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| UI Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MySQL (via `mysql2`) |
| Environment | dotenv |
| CORS | cors |
| Deployment | Vercel (frontend) |

---

## 📁 Project Structure

```
quiz_system/
├── backend/
│   ├── config/
│   │   └── db.js             # MySQL connection pool
│   ├── server.js             # Express server & API routes
│   ├── init-db.js            # Database & table initializer
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/       # Reusable React components
    │   ├── App.jsx           # Root component & routing
    │   ├── api.js            # Axios API helper
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- MySQL database (local or hosted, e.g. Railway)

---

### 1. Clone the Repository

```bash
git clone https://github.com/nisha-shetty03/quiz_system.git
cd quiz_system
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=quiz_platform
PORT=5000
```

Initialize the database (creates tables automatically):

```bash
node init-db.js
```

Start the backend server:

```bash
node server.js
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Note:** Make sure the backend is running before starting the frontend.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user (admin or student) |
| `POST` | `/api/auth/login` | Login with email, password, and role |
| `GET` | `/api/users` | Get all registered users |

> Additional endpoints for quizzes, questions, results, and leaderboard are served from `server.js`.

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `users` | Stores user accounts with roles (`admin` / `student`) |
| `quizzes` | Timed quiz definitions created by admins |
| `questions` | Questions linked to quizzes (MCQ / True-False / Short Answer) |
| `results` | Student quiz attempt records and scores |

---

## 🧑‍💻 Usage

### As an Admin
1. Register with role **Admin**
2. Log in to the Admin portal
3. Create a new quiz — set a title and time limit
4. Add questions with answer options and explanations
5. Publish the quiz for students to attempt

### As a Student
1. Register with role **Student**
2. Log in to the Student portal
3. Select a quiz and start the timed session
4. Submit answers — receive instant feedback
5. Check the leaderboard and your performance history

---

## 📦 Scripts

### Backend
| Command | Description |
|---------|-------------|
| `node server.js` | Start the Express server |
| `node init-db.js` | Initialize database and tables |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🌐 Deployment

- **Frontend** is deployed on [Vercel](https://vercel.com)
- **Backend** can be deployed on [Railway](https://railway.app), Render, or any Node.js host
- Update the API base URL in `frontend/src/api.js` to point to your deployed backend

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👤 Author

**Nisha Shetty** — [@nisha-shetty03](https://github.com/nisha-shetty03)
