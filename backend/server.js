// ==================== Day 9-10: Express + REST API (Full CRUD) ====================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());                    // Allows Angular frontend to connect
app.use(express.json());            // Parses JSON request bodies

// In-memory tasks (MongoDB comes on Day 12)
let tasks = [
  { id: 1, text: "Learn Express routing", completed: true },
  { id: 2, text: "Build full CRUD API", completed: false },
  { id: 3, text: "Connect to Angular on Day 15", completed: false }
];

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
  console.log(`✅ GET /api/tasks → ${tasks.length} tasks returned`);
});

// POST new task
app.post('/api/tasks', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Task text is required' });
  }

  const newTask = {
    id: Date.now(),
    text: text.trim(),
    completed: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
  console.log('✅ POST /api/tasks → Task created');
});

// PUT toggle complete
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === parseInt(id));

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.completed = !task.completed;
  res.json(task);
  console.log(`✅ PUT /api/tasks/${id} → toggled`);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = tasks.length;

  tasks = tasks.filter(t => t.id !== parseInt(id));

  if (tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({ message: 'Task deleted successfully' });
  console.log(`✅ DELETE /api/tasks/${id} → removed`);
});

// Test route
app.get('/', (req, res) => {
  res.send('🚀 TaskFlow Backend is LIVE! <br><br>Try <a href="/api/tasks">/api/tasks</a>');
});

app.listen(PORT, () => {
  console.log(`\n🚀 Express server running at http://localhost:${PORT}`);
  console.log('📡 Test these routes:');
  console.log('   GET    → http://localhost:3000/api/tasks');
  console.log('   POST   → http://localhost:3000/api/tasks');
  console.log('   PUT    → http://localhost:3000/api/tasks/:id');
  console.log('   DELETE → http://localhost:3000/api/tasks/:id');
});