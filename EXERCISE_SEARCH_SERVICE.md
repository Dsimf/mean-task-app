# 🎯 Practice Exercise: Build Your Own Service

Now that you understand Services & Dependency Injection, let's build a **SearchService** for TaskFlow!

## Challenge: Search Service

Create a service that searches tasks by text.

### Requirements
1. ✅ Search tasks by keyword
2. ✅ Highlight matched results
3. ✅ Track search history
4. ✅ Clear search

---

## Step 1: Create the Service

Create `src/app/services/search.service.ts`:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { TaskService, Task } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuery = signal('');
  private searchHistory = signal<string[]>([]);
  
  public readonly query = this.searchQuery.asReadonly();
  public readonly history = this.searchHistory.asReadonly();

  // Computed property: filters tasks based on search query
  public readonly results = computed(() => {
    const term = this.searchQuery().toLowerCase();
    if (!term) return [];
    
    return this.taskService.getAllTasks()
      .filter(task => task.text.toLowerCase().includes(term));
  });

  constructor(private taskService: TaskService) {}

  // ✍️ TODO: Implement these methods
  
  search(query: string): void {
    // TODO: Update searchQuery signal
    // TODO: Add to search history if not empty
  }

  clearSearch(): void {
    // TODO: Reset searchQuery signal
  }

  clearHistory(): void {
    // TODO: Clear search history
  }

  getNumberOfMatches(): number {
    // TODO: Return results count
    return 0;
  }
}
```

---

## Step 2: Complete the Service

Fill in the TODO methods:

<details>
<summary>💡 Hint: How to update signals</summary>

```typescript
// Set a new value
this.searchQuery.set(newValue);

// Update based on current value
this.searchHistory.update(history => [...history, newValue]);

// Get current value
this.searchQuery();
```
</details>

<details>
<summary>✅ Solution (Don't peek before trying!)</summary>

```typescript
search(query: string): void {
  const trimmed = query.trim();
  this.searchQuery.set(trimmed);
  
  if (trimmed) {
    this.searchHistory.update(history => 
      [trimmed, ...history].slice(0, 5)  // Keep last 5
    );
  }
}

clearSearch(): void {
  this.searchQuery.set('');
}

clearHistory(): void {
  this.searchHistory.set([]);
}

getNumberOfMatches(): number {
  return this.results().length;
}
```

</details>

---

## Step 3: Export the Service

Update `src/app/services/index.ts`:

```typescript
export * from './task.service';
export * from './theme.service';
export * from './search.service';  // ← Add this line
```

---

## Step 4: Inject into Component

Update `src/app/app.ts`:

```typescript
import { TaskService, ThemeService, SearchService } from './services';

@Component({ /*...*/ })
export class AppComponent {
  searchText = signal('');

  constructor(
    public taskService: TaskService,
    public themeService: ThemeService,
    public searchService: SearchService  // ← Add
  ) {}

  // Add new method
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchService.search(input.value);
  }

  // Add method to show search results
  showSearchResults(): boolean {
    return this.searchService.query() !== '';
  }
}
```

---

## Step 5: Update Template

Add search UI to `src/app/app.html`:

```html
<!-- Add after the filter buttons -->
<div class="search-section">
  <input 
    type="text" 
    placeholder="Search tasks..."
    (input)="onSearch($event)"
    [value]="searchService.query()"
    class="search-input">
  
  <span *ngIf="showSearchResults()" class="search-results">
    Found {{searchService.getNumberOfMatches()}} matches
  </span>
  
  <button *ngIf="searchService.query()" 
          (click)="searchService.clearSearch()"
          class="clear-search-btn">
    Clear Search
  </button>
</div>

<!-- Show search results instead of filtered tasks when searching -->
<ul id="taskList" class="task-list">
  <li *ngFor="let task of (showSearchResults() ? searchService.results() : taskService.filteredTasks()); let i = index" 
      class="task-item" 
      [class.completed]="task.completed" 
      [class.priority-low]="task.priority === 'low'"
      [class.priority-med]="task.priority === 'med'"
      [class.priority-high]="task.priority === 'high'"
      [style.animation-delay.ms]="i * 100">
    <input type="checkbox" [checked]="task.completed" (change)="toggleComplete(task.id)">
    <span>{{task.text}}</span>
    <button class="delete-btn" (click)="deleteTask(task.id)">×</button>
  </li>
</ul>

<!-- Search history -->
<div *ngIf="searchService.history().length > 0" class="search-history">
  <p>Recent searches:</p>
  <div class="history-tags">
    <button *ngFor="let historyItem of searchService.history()" 
            (click)="searchService.search(historyItem)"
            class="history-tag">
      {{historyItem}}
    </button>
  </div>
  <button (click)="searchService.clearHistory()" class="clear-history">
    Clear history
  </button>
</div>
```

---

## Step 6: Add Styling

Add to `src/app/app.css`:

```css
.search-section {
  padding: 20px 40px;
  display: flex;
  gap: 15px;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid var(--accent-blue);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

.search-results {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.clear-search-btn {
  padding: 10px 20px;
  background: var(--accent-red);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.clear-search-btn:hover {
  background: #c0392b;
  transform: scale(1.05);
}

.search-history {
  padding: 20px 40px;
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
}

.search-history p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.history-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.history-tag {
  padding: 8px 15px;
  background: var(--accent-blue);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.history-tag:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.clear-history {
  padding: 8px 15px;
  background: rgba(231, 76, 60, 0.5);
  color: var(--text-primary);
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.clear-history:hover {
  background: var(--accent-red);
  color: white;
}
```

---

## Testing Your Solution

Run the app and:
1. ✅ Type in the search box
2. ✅ See matching tasks
3. ✅ Click history tags to search again
4. ✅ Clear search/history

---

## 🎓 What You've Learned

- ✅ Creating a service that depends on another service
- ✅ Using computed properties for derived state
- ✅ Reactive signal updates
- ✅ Dependency injection in practice
- ✅ Component-to-service communication

---

## Next Challenges

### Challenge 2: Advanced Search
- Search by priority (filter tasks where priority="high")
- Search with AND/OR operators
- Case-sensitive toggle

### Challenge 3: Filter Service
- Extract all filter logic to a service
- Support custom filters
- Save favorite filters

### Challenge 4: Analytics Service
- Track searches performed
- Count tasks by priority
- Display statistics dashboard

---

## Key Takeaway

> Services make your app:
> - **Reusable** (use SearchService anywhere)
> - **Testable** (mock TaskService in tests)
> - **Maintainable** (all search logic in one place)
> - **Scalable** (easy to add new features)

This is the **foundation of all Angular architecture**! 🚀
