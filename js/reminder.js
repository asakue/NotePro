/**
 * Reminder functionality for notes
 */

// Reminder modal elements
const reminderModal = document.getElementById('reminderModal');
const closeReminderModal = document.getElementById('closeReminderModal');
const reminderDateInput = document.getElementById('reminderDate');
const reminderTimeInput = document.getElementById('reminderTime');
const reminderTextInput = document.getElementById('reminderText');
const saveReminderBtn = document.getElementById('saveReminder');
const cancelReminderBtn = document.getElementById('cancelReminder');

// Storage key for reminders
const REMINDERS_STORAGE_KEY = 'notepro-reminders';

let currentNoteId = null;

/**
 * Initialize reminder functionality
 */
function initReminders() {
  // Set up event listeners
  closeReminderModal.addEventListener('click', closeReminderModal);
  saveReminderBtn.addEventListener('click', saveReminder);
  cancelReminderBtn.addEventListener('click', closeReminderModal);
  
  // Close modal on outside click
  reminderModal.addEventListener('click', (e) => {
    if (e.target === reminderModal) {
      closeReminderModal();
    }
  });
  
  // Set default values
  const today = new Date();
  reminderDateInput.valueAsDate = today;
  reminderTimeInput.value = formatTime(today);
  
  // Check for pending reminders on startup
  checkReminders();
  
  // Set up periodic checks for reminders
  setInterval(checkReminders, 60000); // Check every minute
}

/**
 * Format time for the time input
 * @param {Date} date - Date to format
 * @returns {String} Formatted time string (HH:MM)
 */
function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Open the reminder modal for a note
 * @param {Number} noteId - ID of the note
 */
function openReminderModal(noteId) {
  currentNoteId = noteId;
  
  // Get the current note
  const note = app.storage.getNoteById(noteId);
  if (!note) return;
  
  // Set default reminder text to note title
  reminderTextInput.value = note.title;
  
  // Set default date and time (now + 1 hour)
  const defaultReminderTime = new Date();
  defaultReminderTime.setHours(defaultReminderTime.getHours() + 1);
  
  reminderDateInput.valueAsDate = defaultReminderTime;
  reminderTimeInput.value = formatTime(defaultReminderTime);
  
  // Show modal
  reminderModal.style.display = 'flex';
}

/**
 * Close the reminder modal
 */
function closeReminderModal() {
  reminderModal.style.display = 'none';
  currentNoteId = null;
}

/**
 * Save a reminder for the current note
 */
function saveReminder() {
  if (!currentNoteId) return;
  
  // Get values from inputs
  const dateStr = reminderDateInput.value;
  const timeStr = reminderTimeInput.value;
  const reminderText = reminderTextInput.value.trim();
  
  // Validate inputs
  if (!dateStr || !timeStr || !reminderText) {
    showToast('Пожалуйста, заполните все поля', 'warning');
    return;
  }
  
  // Create reminder timestamp
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const reminderDate = new Date(year, month - 1, day, hours, minutes);
  
  // Check if date is in the past
  if (reminderDate < new Date()) {
    showToast('Нельзя создать напоминание в прошлом', 'warning');
    return;
  }
  
  // Create reminder object
  const reminder = {
    id: Date.now(),
    noteId: currentNoteId,
    text: reminderText,
    timestamp: reminderDate.getTime(),
    notified: false
  };
  
  // Save reminder to storage
  saveReminderToStorage(reminder);
  
  // Show success message
  showToast('Напоминание создано', 'success');
  
  // Close modal
  closeReminderModal();
}

/**
 * Save a reminder to local storage
 * @param {Object} reminder - Reminder object to save
 */
function saveReminderToStorage(reminder) {
  // Get existing reminders
  const reminders = getRemindersFromStorage();
  
  // Add new reminder
  reminders.push(reminder);
  
  // Save back to storage
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
}

/**
 * Get all reminders from storage
 * @returns {Array} Array of reminder objects
 */
function getRemindersFromStorage() {
  const remindersJson = localStorage.getItem(REMINDERS_STORAGE_KEY);
  return remindersJson ? JSON.parse(remindersJson) : [];
}

/**
 * Check for pending reminders that need to be shown
 */
function checkReminders() {
  const reminders = getRemindersFromStorage();
  const now = Date.now();
  let updated = false;
  
  reminders.forEach(reminder => {
    // Check if reminder is due and hasn't been notified yet
    if (reminder.timestamp <= now && !reminder.notified) {
      // Show the notification
      showReminderNotification(reminder);
      
      // Mark as notified
      reminder.notified = true;
      updated = true;
    }
  });
  
  // Update storage if any reminders were changed
  if (updated) {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  }
}

/**
 * Show a notification for a reminder
 * @param {Object} reminder - Reminder object
 */
function showReminderNotification(reminder) {
  // If browser supports notifications, request permission and show one
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('NotePro: Напоминание', {
          body: reminder.text,
          icon: '../generated-icon.png'
        });
      }
    });
  }
  
  // Also show a toast
  showToast(`Напоминание: ${reminder.text}`, 'info');
  
  // Try to find and open the related note
  if (reminder.noteId) {
    const note = app.storage.getNoteById(reminder.noteId);
    if (note) {
      // Ask if user wants to open the note
      if (confirm(`Напоминание: ${reminder.text}\n\nОткрыть связанную заметку?`)) {
        app.ui.openEditNoteModal(reminder.noteId);
      }
    }
  }
}

/**
 * Delete all completed reminders
 */
function clearCompletedReminders() {
  const reminders = getRemindersFromStorage();
  const activeReminders = reminders.filter(reminder => !reminder.notified);
  
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(activeReminders));
  
  showToast('Выполненные напоминания очищены', 'success');
}

// Add a button to the note modal toolbar for reminders
function addReminderButton() {
  // Add button to UI when available
  const interval = setInterval(() => {
    const noteModal = document.getElementById('noteModal');
    if (noteModal) {
      clearInterval(interval);
      
      // Create a reminder button
      const footerLeft = document.querySelector('.modal-footer-left');
      if (footerLeft) {
        const reminderBtn = document.createElement('button');
        reminderBtn.className = 'reminder-button';
        reminderBtn.innerHTML = '<i class="fas fa-bell"></i> Напомнить';
        reminderBtn.style.backgroundColor = 'var(--warning-color)';
        reminderBtn.style.color = 'white';
        reminderBtn.style.padding = '10px 20px';
        reminderBtn.style.border = 'none';
        reminderBtn.style.borderRadius = 'var(--border-radius)';
        reminderBtn.style.display = 'flex';
        reminderBtn.style.alignItems = 'center';
        reminderBtn.style.gap = '8px';
        reminderBtn.style.cursor = 'pointer';
        reminderBtn.style.transition = 'all 0.2s';
        
        reminderBtn.addEventListener('mouseenter', () => {
          reminderBtn.style.transform = 'translateY(-2px)';
          reminderBtn.style.backgroundColor = '#e69500';
        });
        
        reminderBtn.addEventListener('mouseleave', () => {
          reminderBtn.style.transform = 'translateY(0)';
          reminderBtn.style.backgroundColor = 'var(--warning-color)';
        });
        
        reminderBtn.addEventListener('click', () => {
          const noteId = app.ui.activeNoteId;
          if (noteId) {
            openReminderModal(noteId);
          }
        });
        
        footerLeft.appendChild(reminderBtn);
      }
    }
  }, 500);
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  initReminders();
  addReminderButton();
});