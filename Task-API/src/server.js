const express = require("express");
require("dotenv").config();

const db = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

const PORT = process.env.PORT || 5000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());


// ===============================
// BASIC ROUTES
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "Task API is running!"
    });
});

app.get("/test-db", (req, res) => {
    const tables = db
        .prepare(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
        `)
        .all();

    res.json(tables);
});


// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);


// ===============================
// 404 ROUTE HANDLER
// ===============================

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});


// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: "Internal server error"
    });
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});