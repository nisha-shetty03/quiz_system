const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  let connection;
  try {
    // Connect without database first to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'quiz_platform';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log(`Database '${dbName}' ready.`);

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'student') NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quizzes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        timeLimit INT NOT NULL,
        passMark INT NOT NULL,
        status ENUM('draft', 'published') DEFAULT 'draft',
        createdBy INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Questions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quizId INT NOT NULL,
        type ENUM('mcq', 'tf', 'short') NOT NULL,
        questionText TEXT NOT NULL,
        options JSON,
        correctAnswer TEXT NOT NULL,
        explanation TEXT,
        CHECK (CHAR_LENGTH(explanation) <= 500),
        FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);

    // Attempts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quizId INT NOT NULL,
        studentId INT NOT NULL,
        answers JSON NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        timeTaken INT NOT NULL,
        passed BOOLEAN NOT NULL,
        submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Tables created successfully.");

    // Seed Data
    const [users] = await connection.query('SELECT * FROM users');
    if (users.length === 0) {
      console.log("Seeding initial data...");
      await connection.query(`
        INSERT INTO users (name, email, password, role) VALUES
        ('Admin One', 'admin@quiz.com', 'demo', 'admin'),
        ('Student One', 'student1@quiz.com', 'demo', 'student')
      `);
      console.log("Seeded basic admin and student users.");
    }

  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    if (connection) await connection.end();
  }
}

initDB();
