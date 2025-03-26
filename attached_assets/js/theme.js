/**
 * Theme management functionality
 */

/**
 * Theme manager class - Handles theme switching and persistence
 */
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('notepro-theme') || 'light';
    this.themeToggle = document.getElementById('darkModeToggle');
  }
  
  /**
   * Initialize theme manager
   */
  init() {
    // Apply the saved theme
    this.setTheme(this.currentTheme);
    
    // Set the toggle switch state
    if (this.themeToggle) {
      this.themeToggle.checked = this.currentTheme === 'dark';
      
      // Listen for toggle changes
      this.themeToggle.addEventListener('change', () => {
        this.toggleTheme();
      });
    }
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.checkSystemPreference();
    });
    
    // Initial check for system preference
    this.checkSystemPreference();
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  /**
   * Set the theme
   * @param {String} theme - 'light' or 'dark'
   */
  setTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    this.currentTheme = theme;
    localStorage.setItem('notepro-theme', theme);
    
    // Update toggle state if it exists
    if (this.themeToggle) {
      this.themeToggle.checked = theme === 'dark';
    }
  }
  
  /**
   * Check system preference for dark mode
   */
  checkSystemPreference() {
    // Only apply system preference if the user hasn't explicitly set a theme
    if (!localStorage.getItem('notepro-theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }
}