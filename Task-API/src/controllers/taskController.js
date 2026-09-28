const db = require("../config/database");

// ===============================
// CREATE TASK
// ===============================
const createTask = (req, res) => {
    try {
        const { title, description } = req.body;

        // Check title
        if (!title) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        // Insert task
        const result = db
            .prepare(`
                INSERT INTO tasks (user_id, title, description)
                VALUES (?, ?, ?)
            `)
            .run(
                req.user.userId,
                title,
                description || null
            );

        // Get created task
        const task = db
            .prepare(`
                SELECT
                    id,
                    user_id,
                    title,
                    description,
                    completed,
                    created_at,
                    updated_at
                FROM tasks
                WHERE id = ?
            `)
            .get(result.lastInsertRowid);

        return res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ===============================
// GET ALL TASKS
// ===============================
const getTasks = (req, res) => {
    try {
        const tasks = db
            .prepare(`
                SELECT
                    id,
                    user_id,
                    title,
                    description,
                    completed,
                    created_at,
                    updated_at
                FROM tasks
                WHERE user_id = ?
                ORDER BY created_at DESC
            `)
            .all(req.user.userId);

        return res.status(200).json({
            message: "Tasks fetched successfully",
            tasks
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ===============================
// GET SINGLE TASK
// ===============================
const getTaskById = (req, res) => {
    try {
        const taskId = req.params.id;

        const task = db
            .prepare(`
                SELECT
                    id,
                    user_id,
                    title,
                    description,
                    completed,
                    created_at,
                    updated_at
                FROM tasks
                WHERE id = ? AND user_id = ?
            `)
            .get(taskId, req.user.userId);

        // Task not found
        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task fetched successfully",
            task
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// ===============================
// UPDATE TASK
// ===============================
const updateTask = (req, res) => {
    try {
        const taskId = req.params.id;

        const {
            title,
            description,
            completed
        } = req.body;

        // Check whether task belongs to logged-in user
        const existingTask = db
            .prepare(`
                SELECT *
                FROM tasks
                WHERE id = ? AND user_id = ?
            `)
            .get(taskId, req.user.userId);

        if (!existingTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Validation
        if (!title) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        // Update task
        db.prepare(`
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                completed = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `).run(
            title,
            description || null,
            completed ? 1 : 0,
            taskId,
            req.user.userId
        );

        // Get updated task
        const updatedTask = db
            .prepare(`
                SELECT
                    id,
                    user_id,
                    title,
                    description,
                    completed,
                    created_at,
                    updated_at
                FROM tasks
                WHERE id = ? AND user_id = ?
            `)
            .get(taskId, req.user.userId);

        return res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ===============================
// DELETE TASK
// ===============================
const deleteTask = (req, res) => {
    try {
        const taskId = req.params.id;

        // Check whether task belongs to logged-in user
        const existingTask = db
            .prepare(`
                SELECT id
                FROM tasks
                WHERE id = ? AND user_id = ?
            `)
            .get(taskId, req.user.userId);

        // Task not found
        if (!existingTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Delete task
        db
            .prepare(`
                DELETE FROM tasks
                WHERE id = ? AND user_id = ?
            `)
            .run(taskId, req.user.userId);

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};