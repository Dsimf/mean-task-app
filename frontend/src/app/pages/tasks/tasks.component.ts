import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService, ThemeService } from '../../services';

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
  trackByFn(index: number, task: any): number {
    return task.id;
  }
  taskForm!: FormGroup;
  showValidationErrors = signal(false);

  constructor(
    public taskService: TaskService,
    public themeService: ThemeService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Services initialize themselves
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
    this.taskService.addTask(taskText);
    this.taskForm.reset();
    this.showValidationErrors.set(false);
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

  // Event handlers (delegated to services)
  toggleComplete(taskId: number): void {
    this.taskService.toggleTask(taskId);
  }

  deleteTask(taskId: number): void {
    this.taskService.deleteTask(taskId);
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.taskService.setFilter(filter);
  }

  clearCompleted(): void {
    this.taskService.clearCompleted();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}
