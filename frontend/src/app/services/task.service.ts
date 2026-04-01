import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Task {
  _id?: string;           // MongoDB uses _id
  id?: number;            // fallback for old tasks
  text: string;
  completed: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/tasks';   // Backend URL
  
  // Loading and error state management
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  // GET all tasks from backend
  getTasks(): Observable<Task[]> {
    this.setLoading(true);
    this.clearError();
    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap(() => this.clearError()),
      catchError(err => this.handleError(err)),
      finalize(() => this.setLoading(false))
    );
  }

  // POST new task
  addTask(text: string): Observable<Task> {
    this.setLoading(true);
    this.clearError();
    return this.http.post<Task>(this.apiUrl, { text }).pipe(
      tap(() => this.clearError()),
      catchError(err => this.handleError(err)),
      finalize(() => this.setLoading(false))
    );
  }

  // PUT toggle complete (no loading state for optimistic updates)
  toggleComplete(id: string): Observable<Task> {
    this.clearError();
    return this.http.put<Task>(`${this.apiUrl}/${id}`, {}).pipe(
      tap(() => this.clearError()),
      catchError(err => this.handleError(err))
    );
  }

  // DELETE task
  deleteTask(id: string): Observable<any> {
    this.setLoading(true);
    this.clearError();
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearError()),
      catchError(err => this.handleError(err)),
      finalize(() => this.setLoading(false))
    );
  }

  // Search tasks locally
  searchTasks(tasks: Task[], query: string): Task[] {
    if (!query.trim()) {
      return tasks;
    }
    const lowerQuery = query.toLowerCase();
    return tasks.filter(task => task.text.toLowerCase().includes(lowerQuery));
  }

  // Clear completed tasks
  clearCompleted(): Observable<any> {
    this.clearError();
    return this.http.delete(`${this.apiUrl}/completed`).pipe(
      tap(() => this.clearError()),
      catchError(err => this.handleError(err))
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (isPlatformBrowser(this.platformId) && error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error: ${error.status} - ${error.statusText}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    this.setError(errorMessage);
    console.error('TaskService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // State management helpers
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }
}
