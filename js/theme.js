/**
 * Theme management functionality
 */

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle');
    this.currentTheme = localStorage.getItem('theme') || 'light';
    
    this.init();
  }
  
  /**
   * Initialize theme manager
   */
  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);
    
    // Set toggle state
    this.themeToggle.checked = this.currentTheme === 'dark';
    
    // Add event listener
    this.themeToggle.addEventListener('change', () => {
      this.toggleTheme();
    });
    
    // Check system preference
    this.checkSystemPreference();
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    this.currentTheme = newTheme;
    localStorage.setItem('theme', newTheme);
  }
  
  /**
   * Set the theme
   * @param {String} theme - 'light' or 'dark'
   */
  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
  
  /**
   * Check system preference for dark mode
   */
  checkSystemPreference() {
    // Only check if user has not set a preference
    if (!localStorage.getItem('theme')) {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDarkMode) {
        this.setTheme('dark');
        this.currentTheme = 'dark';
        this.themeToggle.checked = true;
      }
      
      // Listen for changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only auto switch if user hasn't explicitly set a preference
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
          this.currentTheme = newTheme;
          this.themeToggle.checked = e.matches;
        }
      });
    }
  }
}
