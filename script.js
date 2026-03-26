// DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Store tasks locally
let tasks = [];

// Mock API endpoint (we'll replace later)
const API_URL = 'https://jsonplaceholder.typicode.com/todos';

// Render tasks
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            tasks.splice(index, 1);
            renderTasks();
            // In real app, we'd call delete API here
        });
        
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

// Load tasks from mock API
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const todos = await response.json();
        // Take first 5 todos and map to our task format
        tasks = todos.slice(0, 5).map(todo => ({ text: todo.title }));
        renderTasks();
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
}

// Add a new task via mock API
async function addTaskToAPI(text) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: text, completed: false })
        });
        const newTodo = await response.json();
        // The mock API returns a new todo with an id, but we don't use it now
        console.log('Added todo:', newTodo);
    } catch (error) {
        console.error('Failed to add task:', error);
        throw error;
    }
}

// Handle form submission
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text) {
        try {
            await addTaskToAPI(text);
            tasks.push({ text });
            taskInput.value = '';
            renderTasks();
        } catch (error) {
            alert('Failed to add task. Please try again.');
        }
    }
});

// Load tasks when page loads
loadTasks();