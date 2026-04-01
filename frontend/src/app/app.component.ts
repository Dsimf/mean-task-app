import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from './services/task.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  tasks: Task[] = [];
  filteredTasksList: Task[] = [];
  currentFilter: 'all' | 'active' | 'completed' = 'all';
  taskForm: FormGroup;
  
  // New properties for UX enhancements
  isLoading = false;
  errorMessage: string | null = null;
  searchQuery = '';
  confirmDeleteTask: Task | null = null; // For confirmation dialog
  successMessage: string | null = null;
  
  // Cached counts for performance
  private activeCount = 0;
  private completedCount = 0;

  constructor() {
    this.taskForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.loadTasks();
    // Subscribe to service loading and error states
    this.taskService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
    this.taskService.error$.subscribe(error => {
      this.errorMessage = error;
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.updateFilteredTasks();
        this.showSuccess('Tasks loaded successfully');
      },
      error: (err) => {
        console.error('Failed to load tasks from backend', err);
        this.errorMessage = 'Could not connect to backend. Is the Node server running?';
      }
    });
  }

  addTask() {
    if (this.taskForm.invalid) return;

    const taskText = this.taskForm.value.text;
    this.taskService.addTask(taskText).subscribe({
      next: (newTask) => {
        this.tasks.unshift(newTask);   // add to top
        this.taskForm.reset();
        this.updateFilteredTasks();
        this.showSuccess('Task added successfully');
      },
      error: (err) => {
        this.errorMessage = 'Error adding task: ' + err.message;
        console.error('Error adding task', err);
      }
    });
  }

  toggleComplete(task: Task) {
    const id = task._id || task.id;
    if (!id) return;

    // Optimistic update: immediately update UI
    const originalCompleted = task.completed;
    task.completed = !task.completed;
    this.updateFilteredTasks();

    // Then make the API call (without success message for better performance)
    this.taskService.toggleComplete(String(id)).subscribe({
      next: (updatedTask) => {
        // API call succeeded, update with server response
        const index = this.tasks.findIndex(t => (t._id || t.id) === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.updateFilteredTasks();
        }
      },
      error: (err) => {
        // API call failed, revert the optimistic update
        task.completed = originalCompleted;
        this.updateFilteredTasks();
        this.errorMessage = 'Error toggling task: ' + err.message;
        console.error('Error toggling task', err);
      }
    });
  }

  // Show delete confirmation dialog
  showDeleteConfirmation(task: Task) {
    this.confirmDeleteTask = task;
  }

  // Cancel delete
  cancelDelete() {
    this.confirmDeleteTask = null;
  }

  deleteTask(task: Task) {
    const id = task._id || task.id;
    if (!id) return;

    this.taskService.deleteTask(String(id)).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => (t._id || t.id) !== id);
        this.updateFilteredTasks();
        this.confirmDeleteTask = null;
        this.showSuccess('Task deleted successfully');
      },
      error: (err) => {
        this.errorMessage = 'Error deleting task: ' + err.message;
        this.confirmDeleteTask = null;
        console.error('Error deleting task', err);
      }
    });
  }

  setFilter(filter: 'all' | 'active' | 'completed') {
    this.currentFilter = filter;
    this.updateFilteredTasks();
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.updateFilteredTasks();
  }

  private updateFilteredTasks() {
    // First filter by status
    let filtered = this.tasks.filter(task => {
      if (this.currentFilter === 'active') return !task.completed;
      if (this.currentFilter === 'completed') return task.completed;
      return true;
    });

    // Then apply search filter
    filtered = this.taskService.searchTasks(filtered, this.searchQuery);
    this.filteredTasksList = filtered;
    
    // Update cached counts for performance
    this.updateCounts();
  }

  private updateCounts() {
    this.activeCount = this.tasks.filter(t => !t.completed).length;
    this.completedCount = this.tasks.filter(t => t.completed).length;
  }

  get filteredTasks(): Task[] {
    return this.filteredTasksList;
  }

  // Dismiss error message
  dismissError() {
    this.errorMessage = null;
  }

  // Show success message (auto-dismiss after 3 seconds)
  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  // Dismiss success message
  dismissSuccess() {
    this.successMessage = null;
  }

  // Helper methods for template
  getActiveCount(): number {
    return this.activeCount;
  }

  getCompletedCount(): number {
    return this.completedCount;
  }

  // Clear all completed tasks
  clearCompleted(): void {
    const completedCount = this.completedCount;
    if (completedCount === 0) return;

    // Optimistic update: remove completed tasks immediately
    const originalTasks = [...this.tasks];
    this.tasks = this.tasks.filter(task => !task.completed);
    this.updateFilteredTasks();

    this.taskService.clearCompleted().subscribe({
      next: (result) => {
        console.log('Completed tasks cleared:', result);
        this.showSuccess(`${result.deletedCount} completed tasks cleared`);
      },
      error: (error) => {
        console.error('Error clearing completed tasks:', error);
        this.errorMessage = 'Failed to clear completed tasks: ' + (error?.message || 'unknown');

        // Revert optimistic UI on error
        this.tasks = originalTasks;
        this.updateFilteredTasks();
      }
    });
  }
}
