/**
 * Rich text editor functionality
 */

// Track active buttons
let activeButtons = [];

/**
 * Initialize rich text editor functionality
 */
function initRichTextEditor() {
  const buttons = document.querySelectorAll('.editor-toolbar button');
  const editor = document.getElementById('modalNoteContent');
  
  if (!buttons || !editor) return;
  
  // Add event listeners to toolbar buttons
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const command = button.dataset.command;
      
      if (!command) return;
      
      // Handle special commands
      if (command === 'createLink') {
        const url = prompt('Введите URL ссылки:', 'https://');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else if (command === 'insertImage') {
        const url = prompt('Введите URL изображения:', 'https://');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else {
        // Execute standard command
        document.execCommand(command, false, null);
      }
      
      // Update button states
      updateButtonStates();
      
      // Focus back on editor
      editor.focus();
      
      // Update statistics
      const text = extractTextFromHtml(editor.innerHTML);
      updateNoteStats(text);
    });
  });
  
  // Selection change event to update button states
  editor.addEventListener('keyup', updateButtonStates);
  editor.addEventListener('mouseup', updateButtonStates);
  editor.addEventListener('click', updateButtonStates);
  
  // Update statistics on content change
  editor.addEventListener('input', function() {
    const text = extractTextFromHtml(this.innerHTML);
    updateNoteStats(text);
  });
  
  // Handle paste to keep only clean HTML
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    
    // Get pasted text - handle both plain and HTML formats
    let text;
    const clipboardData = e.clipboardData || window.clipboardData;
    
    if (clipboardData.getData('text/html')) {
      // If HTML is available, use it
      text = sanitizeHtml(clipboardData.getData('text/html'));
    } else {
      // Otherwise use plain text
      text = clipboardData.getData('text/plain');
      // Convert plain text line breaks to <br>
      text = text.replace(/\n/g, '<br>');
    }
    
    // Insert at current cursor position
    document.execCommand('insertHTML', false, text);
    
    // Update statistics
    updateNoteStats(extractTextFromHtml(editor.innerHTML));
  });
  
  // Initial button state
  updateButtonStates();
}

/**
 * Update the active state of toolbar buttons based on current selection
 */
function updateButtonStates() {
  const buttons = document.querySelectorAll('.editor-toolbar button');
  
  buttons.forEach(button => {
    const command = button.dataset.command;
    
    if (!command) return;
    
    try {
      // Check if command is active
      const isActive = document.queryCommandState(command);
      
      // Update button state
      if (isActive) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    } catch (e) {
      // Some commands may not be supported by all browsers
      console.log(`Command not supported: ${command}`);
    }
  });
}

// Initialize editor on DOM content loaded
document.addEventListener('DOMContentLoaded', initRichTextEditor);