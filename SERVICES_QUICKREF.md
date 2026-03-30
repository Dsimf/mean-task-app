# Services & Dependency Injection - Quick Reference

## What's a Service?

A service is a class that encapsulates business logic and data, separate from components. Think of it as a "worker" that handles specific tasks.

```
Component (UI Worker)      → Shows data, handles clicks
                ↓
Service (Business Worker)  → Processes data, manages state
                ↓
Data Source (API/Storage)  → Provides raw data
```

## Creating a New Service

### Step 1: Create the Service File
Create `src/app/services/notification.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'  // ← Makes it a singleton
})
export class NotificationService {
  private notifications = signal<string[]>([]);
  
  public readonly notificationList = this.notifications.asReadonly();

  addNotification(message: string): void {
    this.notifications.update(n => [...n, message]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.notifications.update(n => n.slice(1));
    }, 3000);
  }
}
```

### Step 2: Export in Index
Update `src/app/services/index.ts`:

```typescript
export * from './task.service';
export * from './theme.service';
export * from './notification.service';  // ← Add this
```

### Step 3: Inject into Component
Update `src/app/app.ts`:

```typescript
import { TaskService, ThemeService, NotificationService } from './services';

@Component({ /*...*/ })
export class AppComponent {
  constructor(
    public taskService: TaskService,
    public themeService: ThemeService,
    public notificationService: NotificationService  // ← Add
  ) {}

  addTask(): void {
    this.taskService.addTask(this.newTaskText());
    this.notificationService.addNotification('Task added! ✅');
  }
}
```

### Step 4: Use in Template
Update `src/app/app.html`:

```html
<!-- Show notifications -->
<div class="notifications">
  <div *ngFor="let msg of notificationService.notificationList()" 
       class="notification">
    {{msg}}
  </div>
</div>
```

---

## Common Patterns

### Pattern 1: Singleton Service (Shared State)
```typescript
@Injectable({
  providedIn: 'root'  // ← Single instance for entire app
})
export class SharedDataService {
  data = signal({ /*...*/ });
}
```

**Use Case:** Global app state (current user, app settings, theme)

### Pattern 2: Component-Scoped Service
```typescript
@Component({
  selector: 'app-task-list',
  providers: [TaskListService]  // ← New instance per component
})
export class TaskListComponent {
  constructor(public taskListService: TaskListService) {}
}
```

**Use Case:** Component-specific state that shouldn't be shared

### Pattern 3: Service with Async Operations
```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private loading = signal(false);
  public readonly isLoading = this.loading.asReadonly();

  async fetchData(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await fetch('/api/data');
      // Process data...
    } finally {
      this.loading.set(false);
    }
  }
}
```

**Use Case:** API calls with loading state

### Pattern 4: Service-to-Service Injection
```typescript
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private taskService: TaskService) {}

  trackTaskAdded(): void {
    console.log('Total tasks:', this.taskService.getTaskCount());
  }
}
```

**Use Case:** Services that depend on other services

---

## Signals in Services

### Creating Signals
```typescript
// Private signal (only modifiable inside service)
private count = signal(0);

// Public read-only access for components
public readonly taskCount = this.count.asReadonly();

// Computed signal (auto-updates)
public readonly taskStats = computed(() => ({
  total: this.count(),
  completed: this.completedCount()
}));
```

### Updating Signals
```typescript
// Direct set
this.count.set(42);

// Update (transform current value)
this.count.update(n => n + 1);

// Broadcast changes automatically
// Components using the signal re-render → Very reactive!
```

---

## Dependency Injection Container

Angular's DI Container:
1. **Registers** services (using `providedIn: 'root'`)
2. **Tracks** dependencies
3. **Instantiates** services when needed
4. **Injects** into components
5. **Reuses** singletons

```
┌──────────────────────────────┐
│   DI Container (Root Injector)
│                              │
│  TaskService    ───→ Singleton
│  ThemeService   ───→ Singleton
│  ValidationSvc  ───→ Singleton
└──────────────────────────────┘
         ↓ Provides to
┌──────────────────────────────┐
│      Your Component          │
│  constructor(                │
│    taskService: TaskService  │ ← Gets singleton
│  ) {}                        │
└──────────────────────────────┘
```

---

## Best Practices

### ✅ DO
```typescript
// Inject via constructor
constructor(private taskService: TaskService) {}

// Make services public if template uses them
constructor(public taskService: TaskService) {}

// Use readonly public signals
public readonly data = this.signal.asReadonly();

// Inject only what you need
constructor(private taskService: TaskService) {}
```

### ❌ DON'T
```typescript
// Don't manually instantiate
taskService = new TaskService();

// Don't expose private signals
public data = signal(...);

// Don't put all logic in component
export class AppComponent {
  addTask() { /* 100 lines of logic */ }
}

// Don't create services from scratch in constructor
constructor() {
  this.api = new HttpClient();  // ← Wrong
}
```

---

## Testing Services

```typescript
// task.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);  // ← Get from DI container
  });

  it('should add a task', () => {
    service.addTask('Test Task');
    expect(service.getAllTasks().length).toBe(1);
  });

  it('should filter tasks', () => {
    service.addTask('Task 1');
    service.setFilter('all');
    expect(service.filteredTasks().length).toBe(1);
  });
});
```

---

## Checklist: Converting Component Logic to Service

- [ ] Identify business logic (data operations, calculations)
- [ ] Create service class with `@Injectable({ providedIn: 'root' })`
- [ ] Move logic methods to service
- [ ] Create signals for state
- [ ] Expose read-only signals as `.asReadonly()`
- [ ] Inject service in component constructor (public)
- [ ] Replace logic calls with service method calls
- [ ] Update template to use service properties
- [ ] Export service in `services/index.ts`

---

## Real-World Example: Search Service

```typescript
// search.service.ts
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuery = signal('');
  private results = signal<Task[]>([]);
  
  public readonly query = this.searchQuery.asReadonly();
  public readonly searchResults = this.results.asReadonly();

  constructor(private taskService: TaskService) {}

  search(term: string): void {
    this.searchQuery.set(term);
    
    const filtered = this.taskService.getAllTasks()
      .filter(task => task.text.includes(term));
    
    this.results.set(filtered);
  }

  clear(): void {
    this.searchQuery.set('');
    this.results.set([]);
  }
}
```

Usage in component:
```typescript
export class AppComponent {
  constructor(public searchService: SearchService) {}

  onSearchInput(term: string): void {
    this.searchService.search(term);
  }
}
```

Template:
```html
<input (input)="onSearchInput($event.target.value)">
<div *ngFor="let result of searchService.searchResults()">
  {{result.text}}
</div>
```

---

**Master Services & DI = Master Angular Architecture! 🎯**
