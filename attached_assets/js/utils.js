/**
 * Utility functions for the notes application
 */

/**
 * Format a date string to locale format
 * @param {String} dateString - ISO date string
 * @returns {String} Formatted date string
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove potentially dangerous elements and attributes
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  const elements = tempDiv.querySelectorAll('*');
  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout'];
  
  elements.forEach(el => {
    dangerousAttrs.forEach(attr => {
      if (el.hasAttribute(attr)) {
        el.removeAttribute(attr);
      }
    });
    
    // Remove javascript: URLs
    if (el.hasAttribute('href') && el.getAttribute('href').toLowerCase().startsWith('javascript:')) {
      el.removeAttribute('href');
    }
  });
  
  return tempDiv.innerHTML;
}

/**
 * Extract plain text from HTML
 * @param {String} html - HTML content to extract text from
 * @returns {String} Plain text content
 */
function extractTextFromHtml(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
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
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Debounce a function to prevent multiple rapid calls
 * @param {Function} func - Function to debounce
 * @param {Number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}