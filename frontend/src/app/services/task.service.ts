import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'med' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private platformId = inject(PLATFORM_ID);
  private tasks = signal<Task[]>([]);
  private currentFilter = signal<'all' | 'active' | 'completed'>('all');

  // Public signals for components to consume
  public readonly taskList = this.tasks.asReadonly();
  public readonly filter = this.currentFilter.asReadonly();

  public readonly filteredTasks = computed(() => {
    const filterType = this.currentFilter();
    return this.tasks().filter(task => {
      if (filterType === 'active') return !task.completed;
      if (filterType === 'completed') return task.completed;
      return true;
    });
  });

  constructor() {
    this.loadTasks();
  }

  /**
   * Calculate priority based on text length
   */
  private getPriority(text: string): 'low' | 'med' | 'high' {
    const length = text.length;
    if (length < 30) return 'low';
    if (length < 60) return 'med';
    return 'high';
  }

  /**
   * Load tasks from localStorage or fetch from API
   */
  async loadTasks(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return; // Skip on server
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
      const fakeApiTasks = await response.json();

      const apiTasks: Task[] = fakeApiTasks.map((todo: any) => ({
        id: Date.now() + todo.id,
        text: todo.title,
        completed: todo.completed,
        priority: this.getPriority(todo.title)
      }));

      const saved = localStorage.getItem('tasks');
      this.tasks.set(saved ? JSON.parse(saved) : apiTasks);
      console.log('%c✅ Tasks loaded from "API" + localStorage', 'color: #3498db; font-weight: bold');
    } catch (error) {
      console.error('API failed, using localStorage only');
      const saved = localStorage.getItem('tasks');
      this.tasks.set(saved ? JSON.parse(saved) : []);
    }
  }

  /**
   * Save tasks to localStorage
   */
  private saveTasks(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tasks', JSON.stringify(this.tasks()));
    }
  }

  /**
   * Add a new task
   */
  addTask(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: Date.now(),
      text: trimmed,
      completed: false,
      priority: this.getPriority(trimmed)
    };

    this.tasks.update(tasks => [...tasks, newTask]);
    this.saveTasks();
  }

  /**
   * Toggle task completion status
   */
  toggleTask(taskId: number): void {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    );
    this.saveTasks();
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: number): void {
    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
    this.saveTasks();
  }

  /**
   * Clear all completed tasks
   */
  clearCompleted(): void {
    this.tasks.update(tasks => tasks.filter(task => !task.completed));
    this.saveTasks();
  }

  /**
   * Set the current filter
   */
  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter.set(filter);
  }

  /**
   * Get all tasks (for debugging or exports)
   */
  getAllTasks(): Task[] {
    return this.tasks();
  }

  /**
   * Get task count
   */
  getTaskCount(): number {
    return this.tasks().length;
  }
}
