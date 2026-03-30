// ==================== Enhanced TaskFlow with Dark Mode & Priorities ====================

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');

let tasks = [];
let currentFilter = 'all';

// Dark mode support
const body = document.body;
const darkToggle = document.createElement('button');
darkToggle.id = 'darkToggle';
darkToggle.textContent = '🌙 Dark Mode';
darkToggle.className = 'dark-toggle-btn';

const toggleDarkMode = () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  darkToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('darkMode', isDark);
};

const initDarkMode = () => {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    toggleDarkMode();
  }
  document.querySelector('.footer').appendChild(darkToggle);
  darkToggle.addEventListener('click', toggleDarkMode);
};

// Priority assignment based on text length
const getPriority = (text) => {
  const length = text.length;
  if (length < 30) return 'low';
  if (length < 60) return 'med';
  return 'high';
};

// Modern: Load tasks from localStorage (or mock API)
const loadTasks = async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
    const fakeApiTasks = await response.json();

    const apiTasks = fakeApiTasks.map(todo => ({
      id: Date.now() + todo.id,
      text: todo.title,
      completed: todo.completed,
      priority: getPriority(todo.title)
    }));

    tasks = JSON.parse(localStorage.getItem('tasks')) || apiTasks;
    console.log('%c✅ Tasks loaded from "API" + localStorage', 'color: #3498db; font-weight: bold');
  } catch (error) {
    console.error('API failed, using localStorage only');
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  }
  renderTasks();
};

// Save to localStorage
const saveTasks = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Add task
const addTask = () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    completed: false,
    priority: getPriority(text)
  };

  tasks = [...tasks, newTask];
  taskInput.value = '';
  saveTasks();
  renderTasks();
};

// Render tasks
const renderTasks = () => {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
    li.setAttribute('data-priority', task.priority);
    li.style.animationDelay = `${index * 0.1}s`;
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''}>
      <span>${task.text}</span>
      <button class="delete-btn">×</button>
    `;

    li.querySelector('input').addEventListener('change', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });

  updateTaskCount();
};

// Update task count with color logic
const updateTaskCount = () => {
  taskCount.textContent = `${tasks.length} tasks`;
  taskCount.classList.remove('high');
  if (tasks.length > 10) {
    taskCount.classList.add('high');
  }
};

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

// Event listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

// ==================== Initialize App ====================
initDarkMode();
loadTasks();
