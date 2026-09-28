const Database = require("better-sqlite3");

// Create or open SQLite database
const db = new Database("database.sqlite");

// Enable foreign keys
db.pragma("foreign_keys = ON");

console.log("SQLite database connected");

// Create users table
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

db.prepare(createUsersTable).run();

console.log("Users table ready");

// Create tasks table
const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`;

db.prepare(createTasksTable).run();

console.log("Tasks table ready");

module.exports = db;