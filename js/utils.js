/**
 * Utility functions for the notes application
 */

/**
 * Format a date string to locale format
 * @param {String} dateString - ISO date string
 * @returns {String} Formatted date string
 */
function formatDate(dateString) {
  const options = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const date = new Date(dateString);
  
  // Check if date is today or yesterday
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
                  
  const isYesterday = date.getDate() === yesterday.getDate() && 
                     date.getMonth() === yesterday.getMonth() && 
                     date.getFullYear() === yesterday.getFullYear();
  
  if (isToday) {
    return `Сегодня, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    return `Вчера, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('ru-RU', options);
  }
}

/**
 * Generate a unique ID
 * @returns {Number} Unique ID based on timestamp
 */
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Sanitize HTML content to prevent XSS
 * @param {String} html - HTML content to sanitize
 * @returns {String} Sanitized HTML
 */
function sanitizeHtml(html) {
  if (!html) return '';
  
  // Create a temporary div element
  const tempDiv = document.createElement('div');
  tempDiv.textContent = html;
  
  // Return the cleaned HTML
  return tempDiv.innerHTML;
}

/**
 * Extract plain text from HTML
 * @param {String} html - HTML content to extract text from
 * @returns {String} Plain text content
 */
function extractTextFromHtml(html) {
  if (!html) return '';
  
  // Create a temporary div element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Return the text content
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Download data as a file
 * @param {String} content - Data to download
 * @param {String} fileName - Name of the file
 * @param {String} contentType - MIME type of the content
 */
function downloadFile(content, fileName, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  
  // Clean up
  URL.revokeObjectURL(a.href);
}

/**
 * Debounce a function to prevent multiple rapid calls
 * @param {Function} func - Function to debounce
 * @param {Number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    const context = this;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}