import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { first } from 'rxjs/operators';

/**
 * HTTP API Service
 * Day 6: Prepare for backend integration (Day 15)
 * Currently uses mock/local storage, but infrastructure is ready for real API calls
 */

export interface ApiTask {
  id: number;
  text: string;
  completed: boolean;
  priority: 'low' | 'med' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  // Will be replaced with real API on Day 15
  private apiUrl = '/api/tasks'; // Node.js backend URL
  private mockApiUrl = 'https://jsonplaceholder.typicode.com/todos';

  /**
   * Get all tasks
   * Will transition to: return this.http.get<Task[]>(this.apiUrl);
   */
  getAllTasks() {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve([]);
    }

    return fetch(this.mockApiUrl + '?_limit=5')
      .then(response => response.json())
      .then((todos: any[]) => todos.map(todo => ({
        id: Date.now() + todo.id,
        text: todo.title,
        completed: todo.completed,
        priority: this.calculatePriority(todo.title)
      })))
      .catch(error => {
        console.error('API Error:', error);
        return [];
      });
  }

  /**
   * Create a new task
   * Day 15: POST to this.http.post<Task>(this.apiUrl, task)
   */
  createTask(task: Omit<ApiTask, 'id'>): Promise<ApiTask> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve({ ...task, id: 0 });
    }

    const newTask: ApiTask = {
      ...task,
      id: Date.now()
    };

    // Placeholder for real API call
    console.log('[API] POST /tasks', newTask);
    return Promise.resolve(newTask);
  }

  /**
   * Update a task
   * Day 15: PUT to this.http.put<Task>(`${this.apiUrl}/${id}`, task)
   */
  updateTask(id: number, updates: Partial<ApiTask>): Promise<ApiTask> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve({ ...updates, id } as ApiTask);
    }

    console.log(`[API] PUT /tasks/${id}`, updates);
    return Promise.resolve({ ...updates, id } as ApiTask);
  }

  /**
   * Delete a task
   * Day 15: DELETE to this.http.delete(`${this.apiUrl}/${id}`)
   */
  deleteTask(id: number): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    console.log(`[API] DELETE /tasks/${id}`);
    return Promise.resolve();
  }

  /**
   * Helper: Calculate task priority based on text length
   */
  private calculatePriority(text: string): 'low' | 'med' | 'high' {
    const length = text.length;
    if (length < 30) return 'low';
    if (length < 60) return 'med';
    return 'high';
  }
}
