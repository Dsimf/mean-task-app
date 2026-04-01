import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService, ThemeService, Task } from '../../services';

/**
 * TasksPage Component
 * Day 6: Refactored for routing + Reactive Forms
 * This is the main tasks page loaded by the router
 */
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  trackByFn(index: number, task: any): string | number {
    return task._id || task.id;
  }
  taskForm!: FormGroup;
  showValidationErrors = signal(false);

  tasks: Task[] = [];
  currentFilter: 'all' | 'active' | 'completed' = 'all';

  constructor(
    public taskService: TaskService,
    public themeService: ThemeService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (err) => {
        console.error('Failed to load tasks from backend', err);
        alert('Could not connect to backend. Is the Node server running?');
      }
    });
  }

  /**
   * Initialize Reactive Form with validation
   * Day 6: Professional form validation
   */
  private initializeForm(): void {
    this.taskForm = this.fb.group({
      taskInput: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200)
        ]
      ]
    });
  }

  /**
   * Add task with form validation
   */
  addTask(): void {
    if (this.taskForm.invalid) {
      this.showValidationErrors.set(true);
      return;
    }

    const taskText = this.taskForm.get('taskInput')?.value;
    this.taskService.addTask(taskText).subscribe({
      next: (newTask) => {
        this.tasks.unshift(newTask);
        this.taskForm.reset();
        this.showValidationErrors.set(false);
      },
      error: (err) => console.error('Error adding task', err)
    });
  }

  /**
   * Get form control for template
   */
  get taskInput() {
    return this.taskForm.get('taskInput');
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const control = this.taskForm.get(fieldName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched || this.showValidationErrors()));
  }

  /**
   * Get error message for display
   */
  getErrorMessage(fieldName: string): string {
    const control = this.taskForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) return 'Task is required';
    if (control.hasError('minlength')) return 'Task must be at least 3 characters';
    if (control.hasError('maxlength')) return 'Task must be less than 200 characters';

    return '';
  }

  // Event handlers
  toggleComplete(task: Task): void {
    const id = task._id || task.id;
    if (!id) return;

    this.taskService.toggleComplete(String(id)).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => (t._id || t.id) === id);
        if (index !== -1) this.tasks[index] = updatedTask;
      },
      error: (err) => console.error('Error toggling task', err)
    });
  }

  deleteTask(task: Task): void {
    const id = task._id || task.id;
    if (!id) return;

    this.taskService.deleteTask(String(id)).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => (t._id || t.id) !== id);
      },
      error: (err) => console.error('Error deleting task', err)
    });
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter = filter;
  }

  filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      if (this.currentFilter === 'active') return !task.completed;
      if (this.currentFilter === 'completed') return task.completed;
      return true;
    });
  }

  getCompletedCount(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  clearCompleted(): void {
    const completedCount = this.getCompletedCount();
    if (completedCount === 0) return;

    // Optimistic update
    const originalTasks = [...this.tasks];
    this.tasks = this.tasks.filter(task => !task.completed);

    this.taskService.clearCompleted().subscribe({
      next: (result) => {
        console.log('Completed tasks cleared:', result);
      },
      error: (error) => {
        console.error('Error clearing completed tasks:', error);
        this.tasks = originalTasks;
      }
    });
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}
