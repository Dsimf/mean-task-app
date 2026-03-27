// Modern Task Manager Script - Refactored for readability and best practices
// Uses arrow functions, cached DOM elements, explicit createElement (no innerHTML)
// Timestamp experiment: Adds "(added at HH:MM)" to each task using Date & template literals

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const taskList = document.getElementById('taskList');

// Add Task Handler
addBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();

  if (taskText === '') {
    alert('Please enter a task!');
    return;
  }

  // Create timestamp
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});

  // Create task item explicitly with createElement
  const li = document.createElement('li');
  li.className = 'task-item';

  const span = document.createElement('span');
  span.textContent = `${taskText} (added at ${timestamp})`;
  li.appendChild(span);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  li.appendChild(deleteBtn);

  taskList.appendChild(li);
  taskInput.value = '';

  // Delete handler for this task
  deleteBtn.addEventListener('click', () => li.remove());
});

// Clear All Handler
clearBtn.addEventListener('click', () => {
  taskList.innerHTML = '';
});
