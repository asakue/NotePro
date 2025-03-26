/**
 * Reminder functionality for notes
 */

/**
 * Initialize reminder functionality
 */
function initReminders() {
  const reminderButton = document.getElementById('reminderNote');
  const reminderModal = document.getElementById('reminderModal');
  const closeReminderButton = document.getElementById('closeReminderModal');
  const saveReminderButton = document.getElementById('saveReminder');
  const reminderDate = document.getElementById('reminderDate');
  const reminderTime = document.getElementById('reminderTime');
  
  if (reminderButton) {
    reminderButton.addEventListener('click', () => openReminderModal());
  }
  
  if (closeReminderButton) {
    closeReminderButton.addEventListener('click', () => closeReminderModal());
  }
  
  if (saveReminderButton) {
    saveReminderButton.addEventListener('click', () => saveReminder());
  }
  
  // Check reminders every minute
  checkReminders();
  setInterval(checkReminders, 60000);
  
  // Set default reminder time when modal is opened
  if (reminderModal) {
    reminderModal.addEventListener('show', () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);
      
      if (reminderDate && reminderTime) {
        reminderDate.value = now.toISOString().split('T')[0];
        reminderTime.value = formatTime(now);
      }
    });
  }
}

/**
 * Format time for the time input
 * @param {Date} date - Date to format
 * @returns {String} Formatted time string (HH:MM)
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Open the reminder modal for a note
 * @param {Number} noteId - ID of the note
 */
function openReminderModal(noteId) {
  const reminderModal = document.getElementById('reminderModal');
  const reminderDate = document.getElementById('reminderDate');
  const reminderTime = document.getElementById('reminderTime');
  
  if (!reminderModal || !reminderDate || !reminderTime) return;
  
  // Set default reminder time (15 minutes from now)
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = formatTime(now);
  
  reminderDate.value = dateStr;
  reminderTime.value = timeStr;
  
  // Show modal
  reminderModal.classList.add('show');
}

/**
 * Close the reminder modal
 */
function closeReminderModal() {
  const reminderModal = document.getElementById('reminderModal');
  if (reminderModal) {
    reminderModal.classList.remove('show');
  }
}

/**
 * Save a reminder for the current note
 */
function saveReminder() {
  const reminderDate = document.getElementById('reminderDate');
  const reminderTime = document.getElementById('reminderTime');
  
  if (!reminderDate || !reminderTime) return;
  
  const currentNoteId = window.notesApp ? window.notesApp.currentNoteId : null;
  if (!currentNoteId) return;
  
  const note = window.notesApp ? window.notesApp.storage.getNoteById(currentNoteId) : null;
  if (!note) return;
  
  const dateStr = reminderDate.value;
  const timeStr = reminderTime.value;
  
  if (!dateStr || !timeStr) {
    if (window.notesApp) {
      window.notesApp.showToast('Please select date and time', 'error');
    }
    return;
  }
  
  const reminderDate = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  
  if (reminderDate <= now) {
    if (window.notesApp) {
      window.notesApp.showToast('Reminder time must be in the future', 'error');
    }
    return;
  }
  
  const reminder = {
    id: Date.now(),
    noteId: note.id,
    noteTitle: note.title,
    time: reminderDate.toISOString(),
    completed: false
  };
  
  saveReminderToStorage(reminder);
  closeReminderModal();
  
  if (window.notesApp) {
    window.notesApp.showToast('Reminder set successfully', 'success');
  }
}

/**
 * Save a reminder to local storage
 * @param {Object} reminder - Reminder object to save
 */
function saveReminderToStorage(reminder) {
  const reminders = getRemindersFromStorage();
  
  // Update if exists, otherwise add
  const index = reminders.findIndex(r => r.id === reminder.id);
  if (index !== -1) {
    reminders[index] = reminder;
  } else {
    reminders.push(reminder);
  }
  
  localStorage.setItem('notepro-reminders', JSON.stringify(reminders));
}

/**
 * Get all reminders from storage
 * @returns {Array} Array of reminder objects
 */
function getRemindersFromStorage() {
  const remindersJson = localStorage.getItem('notepro-reminders');
  return remindersJson ? JSON.parse(remindersJson) : [];
}

/**
 * Check for pending reminders that need to be shown
 */
function checkReminders() {
  const reminders = getRemindersFromStorage();
  const now = new Date();
  
  reminders.forEach(reminder => {
    if (!reminder.completed && new Date(reminder.time) <= now) {
      // Show notification
      showReminderNotification(reminder);
      
      // Mark as completed
      reminder.completed = true;
      saveReminderToStorage(reminder);
    }
  });
  
  // Clean up old reminders (older than 30 days and completed)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const filteredReminders = reminders.filter(reminder => 
    !reminder.completed || new Date(reminder.time) > thirtyDaysAgo
  );
  
  if (filteredReminders.length !== reminders.length) {
    localStorage.setItem('notepro-reminders', JSON.stringify(filteredReminders));
  }
}

/**
 * Show a notification for a reminder
 * @param {Object} reminder - Reminder object
 */
function showReminderNotification(reminder) {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }
  
  // Check if permission is granted
  if (Notification.permission === 'granted') {
    createNotification(reminder);
  } else if (Notification.permission !== 'denied') {
    // Request permission
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        createNotification(reminder);
      }
    });
  }
}

/**
 * Create a notification for a reminder
 * @param {Object} reminder - Reminder object
 */
function createNotification(reminder) {
  const notification = new Notification('Note Reminder', {
    body: reminder.noteTitle,
    icon: '/favicon.ico'
  });
  
  notification.onclick = () => {
    window.focus();
    // Find the note and open it
    if (window.notesApp) {
      window.notesApp.openEditNoteModal(reminder.noteId);
    }
  };
}

/**
 * Delete all completed reminders
 */
function clearCompletedReminders() {
  const reminders = getRemindersFromStorage();
  const filteredReminders = reminders.filter(reminder => !reminder.completed);
  
  localStorage.setItem('notepro-reminders', JSON.stringify(filteredReminders));
  
  if (window.notesApp) {
    window.notesApp.showToast('Cleared completed reminders', 'success');
  }
}

function addReminderButton() {
  const sidebarSettings = document.querySelector('.sidebar-section:last-child');
  if (!sidebarSettings) return;
  
  const reminderOption = document.createElement('div');
  reminderOption.className = 'setting-option';
  reminderOption.innerHTML = `
    <span><i class="fas fa-bell"></i> Reminders</span>
  `;
  
  reminderOption.addEventListener('click', () => {
    const reminders = getRemindersFromStorage();
    const activeReminders = reminders.filter(r => !r.completed);
    const completedReminders = reminders.filter(r => r.completed);
    
    // Show dialog with reminders list
    const dialog = document.createElement('div');
    dialog.className = 'modal';
    dialog.style.display = 'flex';
    
    let remindersList = '';
    
    if (activeReminders.length > 0) {
      remindersList += '<h4>Active Reminders</h4><ul>';
      activeReminders.forEach(reminder => {
        remindersList += `
          <li>
            ${reminder.noteTitle} - 
            ${new Date(reminder.time).toLocaleString()}
          </li>
        `;
      });
      remindersList += '</ul>';
    }
    
    if (completedReminders.length > 0) {
      remindersList += '<h4>Completed Reminders</h4><ul>';
      completedReminders.forEach(reminder => {
        remindersList += `
          <li>
            ${reminder.noteTitle} - 
            ${new Date(reminder.time).toLocaleString()}
          </li>
        `;
      });
      remindersList += '</ul>';
      
      remindersList += `
        <button id="clearCompletedReminders" class="btn">
          Clear Completed Reminders
        </button>
      `;
    }
    
    if (remindersList === '') {
      remindersList = '<p>No reminders set</p>';
    }
    
    dialog.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3>Reminders</h3>
          <button id="closeRemindersDialog" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${remindersList}
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const closeButton = document.getElementById('closeRemindersDialog');
    closeButton.addEventListener('click', () => {
      dialog.remove();
    });
    
    const clearButton = document.getElementById('clearCompletedReminders');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        clearCompletedReminders();
        dialog.remove();
      });
    }
  });
  
  sidebarSettings.appendChild(reminderOption);
}