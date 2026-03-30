import { Routes } from '@angular/router';

/**
 * Application Routes
 * Day 6: Set up routing infrastructure for scalability
 * Currently just tasks, but prepared for future pages (settings, analytics, etc.)
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent),
    data: { title: 'TaskFlow - Manage Your Tasks' }
  },
  // Future routes (prepared for Day 15+)
  // {
  //   path: 'settings',
  //   loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
  // },
  // {
  //   path: 'analytics',
  //   loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent)
  // }
];
