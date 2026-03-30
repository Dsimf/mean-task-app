# TaskFlow Services & Dependency Injection Architecture

## Overview
TaskFlow has been refactored using **Angular Services** and **Dependency Injection (DI)**, following the official Angular architecture patterns from the "Learn Angular" tutorial (steps 4-6).

## What Changed?

### Before (Monolithic Component)
```typescript
// ❌ All logic in component
export class AppComponent implements OnInit {
  tasks = signal<Task[]>([]);
  async loadTasks() { /*...*/ }
  addTask() { /*...*/ }
  toggleTask() { /*...*/ }
  // etc... 50+ lines of business logic
}
```

### After (Separation of Concerns)
```typescript
// ✅ Component only handles UI
@Component({ /*...*/ })
export class AppComponent {
  constructor(
    public taskService: TaskService,
    public themeService: ThemeService
  ) {}
  
  addTask() {
    this.taskService.addTask(this.newTaskText());
  }
}
```

---

## Services Architecture

### TaskService (`src/app/services/task.service.ts`)
Handles all task-related business logic:

| Method | Purpose |
|--------|---------|
| `loadTasks()` | Fetch from API + localStorage |
| `addTask(text)` | Create new task |
| `toggleTask(id)` | Mark complete/incomplete |
| `deleteTask(id)` | Remove task |
| `clearCompleted()` | Remove all completed tasks |
| `setFilter(type)` | Change filter |

**Public Signals (read-only for components):**
- `taskList` - All tasks
- `filter` - Current filter mode
- `filteredTasks` - Computed filtered list

**Key Features:**
- ✅ Automatic localStorage persistence
- ✅ API integration with fallback
- ✅ Priority calculation
- ✅ Reactive signals for UI updates

### ThemeService (`src/app/services/theme.service.ts`)
Manages dark mode state:

| Method | Purpose |
|--------|---------|
| `toggleDarkMode()` | Switch between light/dark |
| `isDarkMode()` | Check current mode |

**Public Signal:**
- `darkMode` - Current theme state

**Persistence:**
- Saves preference to localStorage

---

## Dependency Injection Pattern

### How DI Works
```typescript
// ❌ Bad: Manual instantiation (tight coupling)
export class AppComponent {
  taskService = new TaskService();
}

// ✅ Good: Constructor injection (loose coupling)
export class AppComponent {
  constructor(public taskService: TaskService) {}
}
```

### Service Instantiation
Services are registered with `providedIn: 'root'`:
```typescript
@Injectable({
  providedIn: 'root'  // ← Singleton service for entire app
})
export class TaskService { /*...*/ }
```

This ensures:
- 🎯 **Single instance** shared across the app
- 🔗 **Type-safe** injection
- 🧪 **Testable** (easy to mock)
- 🎨 **Decoupled** (component doesn't create service)

---

## Component Usage

### AppComponent Responsibilities (Only UI)
```typescript
@Component({ /*...*/ })
export class AppComponent {
  constructor(
    public taskService: TaskService,
    public themeService: ThemeService
  ) {}

  // UI Event Handlers
  addTask() {
    this.taskService.addTask(this.newTaskText());
    this.newTaskText.set('');
  }

  toggleComplete(taskId: number) {
    this.taskService.toggleTask(taskId);  // ← Delegate to service
  }
}
```

### Template Access
```html
<!-- Access service directly in template -->
<li *ngFor="let task of taskService.filteredTasks()">
  {{task.text}}
</li>

<button (click)="toggleDarkMode()">
  {{ themeService.darkMode() ? '☀️' : '🌙' }}
</button>
```

---

## Benefits of This Architecture

| Benefit | Why It Matters |
|---------|---|
| **Separation of Concerns** | Component = UI, Service = Logic |
| **Reusability** | Services can be used in multiple components |
| **Testability** | Mock services in unit tests easily |
| **Maintainability** | Easy to find and update business logic |
| **Scalability** | Add new services without touching components |
| **Reactive** | Signals enable automatic UI updates |

---

## File Structure
```
src/app/
├── services/
│   ├── index.ts           (barrel export)
│   ├── task.service.ts    (task business logic)
│   └── theme.service.ts   (theme management)
├── app.ts                 (component - UI only)
├── app.html               (template)
└── app.css                (styles)
```

---

## Next Steps (Future Enhancements)

1. **Add HttpClient Service**
   ```typescript
   constructor(private http: HttpClient) {}
   ```

2. **Create API Service**
   - Abstract API calls
   - Handle errors globally
   - Implement interceptors

3. **Unit Testing**
   ```typescript
   it('should add task', () => {
     service.addTask('Test');
     expect(service.taskList().length).toBe(1);
   });
   ```

4. **Add Storage Service**
   - Abstract localStorage logic
   - Support sessionStorage
   - Implement encryption

5. **Route-Based Components**
   - TaskListComponent
   - TaskDetailComponent
   - SettingsComponent (theme, filters)

---

## References
- [Angular Services Guide](https://angular.io/guide/architecture-services)
- [Dependency Injection Pattern](https://angular.io/guide/dependency-injection)
- [Standalone Components](https://angular.io/guide/standalone-components)
- [Signals API](https://angular.io/guide/signals)

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         AppComponent (View Layer)       │
│  - Handles UI events                    │
│  - Dispatches to services               │
│  - Displays service data via signals    │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────────┐    ┌──────▼─────────┐
   │ TaskService │    │ ThemeService   │
   ├─────────────┤    ├────────────────┤
   │ Tasks State │    │ Dark Mode State│
   │ Business    │    │ Theme Logic    │
   │ Logic       │    │ Persistence    │
   └────┬────────┘    └──────┬─────────┘
        │                     │
   ┌────▼──────────────────────▼──────┐
   │  Local Storage + API               │
   │  (Data Persistence Layer)          │
   └────────────────────────────────────┘
```

---

**TaskFlow is now following Angular best practices! 🚀**
