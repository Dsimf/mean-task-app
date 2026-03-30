import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSignal = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);

  // Public readonly signal
  public readonly darkMode = this.darkModeSignal.asReadonly();

  constructor() {
    this.initializeDarkMode();
  }

  /**
   * Initialize dark mode from localStorage
   */
  private initializeDarkMode(): void {
    if (!isPlatformBrowser(this.platformId)) return; // Skip on server
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      this.enableDarkMode();
    }
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    if (this.darkModeSignal()) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  /**
   * Enable dark mode
   */
  private enableDarkMode(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    }
    this.darkModeSignal.set(true);
  }

  /**
   * Disable dark mode
   */
  private disableDarkMode(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
    this.darkModeSignal.set(false);
  }

  /**
   * Check if dark mode is enabled
   */
  isDarkMode(): boolean {
    return this.darkModeSignal();
  }
}
