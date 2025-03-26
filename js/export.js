/**
 * Export and import functionality for notes
 */

/**
 * Export notes to a JSON file
 */
function exportNotes() {
  const storage = new NotesStorage();
  const jsonData = storage.exportNotes();
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10);
  
  downloadFile(jsonData, `notes-backup-${timestamp}.json`, 'application/json');
  
  // Show success message
  showToast('Заметки успешно экспортированы', 'success');
}

/**
 * Import notes from a JSON file
 * @param {Event} event - File input change event
 */
function importNotes(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file extension
  if (!file.name.endsWith('.json')) {
    showToast('Пожалуйста, выберите файл JSON', 'error');
    event.target.value = '';
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const storage = new NotesStorage();
      const result = storage.importNotes(e.target.result);
      
      if (result.success) {
        // Reload notes
        app.ui.loadNotes();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error importing notes:', error);
      showToast('Ошибка при импорте файла', 'error');
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  reader.onerror = function() {
    showToast('Не удалось прочитать файл', 'error');
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

/**
 * Show a toast notification
 * @param {String} message - Message to show
 * @param {String} type - Type of toast (success, error, warning)
 */
function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Add icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Remove after animation completes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
