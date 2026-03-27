document.getElementById('addBtn').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value;

    if (taskText === '') {
        alert("Please enter a task!");
        return;
    }

    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.className = 'task-item';
    
    li.innerHTML = `
        <span>${taskText}</span>
        <button class="delete-btn">Delete</button>
    `;

    taskList.appendChild(li);
    taskInput.value = ''; // Clear input

    // delete functionality
    li.querySelector('.delete-btn').addEventListener('click', function() {
        li.remove();
    });
});

document.getElementById('clearBtn').addEventListener('click', function() {
    document.getElementById('taskList').innerHTML = '';
});
