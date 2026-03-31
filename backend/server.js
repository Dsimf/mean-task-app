// ==================== Day 13-14: Full Production-Ready REST API ====================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'https://Dsimf.github.io'], // Angular dev + GitHub Pages
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching tasks' });
  }
});

// POST new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const newTask = new Task({ text: text.trim() });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Server error while creating task' });
  }
});

// PUT toggle complete
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error while updating task' });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error while deleting task' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('🚀 TaskFlow Backend is LIVE and connected to MongoDB!');
});

app.listen(PORT, () => {
  console.log(`\n🚀 Express server running at http://localhost:${PORT}`);
  console.log('📡 Full CRUD API ready for Angular!');
});