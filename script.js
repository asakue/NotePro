/**
 * NotePro - Enhanced Notes Application
 * Main application script
 * 
 * Version: 2.5
 * Author: asakue
 */

// Global app
let app = {};

class NotesApp {
  constructor() {
    // Initialize components
    this.storage = new NotesStorage();
    this.ui = new NotesUI(this.storage);
    this.theme = new ThemeManager();
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Set up event listeners for about and privacy modals
    this.initModalEventListeners();
    
    // Set up keyboard shortcuts
    this.initKeyboardShortcuts();
    
    // Set global app reference for use by other scripts
    app = this;
    
    // Check for "Create First Note" button
    const createFirstNoteBtn = document.getElementById('createFirstNote');
    if (createFirstNoteBtn) {
      createFirstNoteBtn.addEventListener('click', () => {
        this.ui.openAddNoteModal();
      });
    }
  }
  
  /**
   * Initialize event listeners for modals
   */
  initModalEventListeners() {
    // About modal
    const aboutModal = document.getElementById('aboutModal');
    const showAboutBtn = document.getElementById('showAbout');
    const closeAboutBtn = document.getElementById('closeAboutModal');
    
    showAboutBtn.addEventListener('click', () => {
      aboutModal.style.display = 'flex';
    });
    
    closeAboutBtn.addEventListener('click', () => {
      aboutModal.style.display = 'none';
    });
    
    // Privacy modal
    const privacyModal = document.getElementById('privacyModal');
    const showPrivacyBtn = document.getElementById('showPrivacy');
    const closePrivacyBtn = document.getElementById('closePrivacyModal');
    
    showPrivacyBtn.addEventListener('click', () => {
      privacyModal.style.display = 'flex';
    });
    
    closePrivacyBtn.addEventListener('click', () => {
      privacyModal.style.display = 'none';
    });
    
    // Close modals on outside click
    document.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        aboutModal.style.display = 'none';
      }
      if (e.target === privacyModal) {
        privacyModal.style.display = 'none';
      }
    });
  }
  
  /**
   * Initialize keyboard shortcuts
   */
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+N: New note
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        this.ui.openAddNoteModal();
      }
      
      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchNotes').focus();
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
          if (window.getComputedStyle(modal).display !== 'none') {
            // Find and click the close button
            const closeBtn = modal.querySelector('.close-button');
            if (closeBtn) {
              closeBtn.click();
            }
          }
        });
      }
    });
  }
  
  /**
   * Handle clear all notes functionality
   */
  initClearAllNotes() {
    const clearAllBtn = document.getElementById('clearAllNotes');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите удалить все заметки? Это действие нельзя отменить.')) {
          this.storage.clearAllNotes();
          this.ui.loadNotes();
          showToast('Все заметки успешно удалены', 'success');
        }
      });
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const notesApp = new NotesApp();
  notesApp.initClearAllNotes();
  
  // Generate an app icon if one doesn't exist
  generateAppIcon();
});

/**
 * Generate an app icon dynamically
 */
function generateAppIcon() {
  const iconExists = document.querySelector('link[rel="icon"]').href;
  if (iconExists && !iconExists.includes('data:')) return;
  
  // Create a canvas to draw the icon
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Draw a note icon
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, 64, 64);
  
  // Add some lines to make it look like a note
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(14, 20);
  ctx.lineTo(50, 20);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(14, 32);
  ctx.lineTo(50, 32);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(14, 44);
  ctx.lineTo(35, 44);
  ctx.stroke();
  
  // Corner fold
  ctx.fillStyle = '#43A047';
  ctx.beginPath();
  ctx.moveTo(44, 0);
  ctx.lineTo(64, 20);
  ctx.lineTo(64, 0);
  ctx.closePath();
  ctx.fill();
  
  // Convert to data URL and set as favicon
  const dataUrl = canvas.toDataURL();
  const favicon = document.querySelector('link[rel="icon"]');
  favicon.href = dataUrl;
  
  // Save URL to local storage to avoid regenerating next time
  localStorage.setItem('app-icon', dataUrl);
}