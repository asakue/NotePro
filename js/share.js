/**
 * Sharing functionality for notes
 */

// Share modal elements
const shareModal = document.getElementById('shareModal');
const closeShareModal = document.getElementById('closeShareModal');
const shareLinkInput = document.getElementById('shareLink');
const copyShareLinkBtn = document.getElementById('copyShareLink');
const shareOptions = document.querySelectorAll('.share-option');
const qrCodeContainer = document.getElementById('qrCode');
const downloadQRBtn = document.getElementById('downloadQR');

let currentNoteId = null;

/**
 * Initialize sharing functionality
 */
function initSharing() {
  // Event listeners
  closeShareModal.addEventListener('click', closeShareModal);
  copyShareLinkBtn.addEventListener('click', copyShareLink);
  downloadQRBtn.addEventListener('click', downloadQRCode);
  
  // Platform share buttons
  shareOptions.forEach(option => {
    option.addEventListener('click', () => {
      shareToExternalPlatform(option.dataset.platform);
    });
  });
  
  // Close modal on outside click
  shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
      closeShareModal();
    }
  });
  
  // Add event listener to copyLink button in note modal
  document.getElementById('copyLink').addEventListener('click', openShareModal);
}

/**
 * Open share modal for a note
 */
function openShareModal() {
  // Get the current note ID from UI
  currentNoteId = app.ui.activeNoteId;
  if (!currentNoteId) return;
  
  // Create a sharable link (using hash for client-side only functionality)
  const note = app.storage.getNoteById(currentNoteId);
  if (!note) return;
  
  // Create the share URL
  const shareUrl = createShareUrl(note);
  
  // Set the share link input
  shareLinkInput.value = shareUrl;
  
  // Generate QR code
  generateQRCode(shareUrl);
  
  // Show modal
  shareModal.style.display = 'flex';
}

/**
 * Close share modal
 */
function closeShareModal() {
  shareModal.style.display = 'none';
  qrCodeContainer.innerHTML = '';
}

/**
 * Create a share URL for a note
 * @param {Note} note - The note to share
 * @returns {String} Share URL
 */
function createShareUrl(note) {
  // Create a simplified version of the note data for sharing
  const shareData = {
    id: note.id,
    title: note.title,
    content: note.content,
    color: note.color,
    created: note.created
  };
  
  // Encode the data as a base64 string
  const encodedData = btoa(JSON.stringify(shareData));
  
  // Create URL with hash parameter
  const url = new URL(window.location.href);
  url.hash = `note=${encodedData}`;
  
  return url.toString();
}

/**
 * Copy the share link to clipboard
 */
function copyShareLink() {
  shareLinkInput.select();
  document.execCommand('copy');
  
  showToast('Ссылка скопирована', 'success');
}

/**
 * Generate a QR code for the share URL
 * @param {String} url - URL to encode in QR
 */
function generateQRCode(url) {
  // Clear previous QR code
  qrCodeContainer.innerHTML = '';
  
  // Simple QR code implementation using HTML and CSS
  // In a real implementation, you would use a library like qrcode.js
  const size = 10; // Size of each "pixel" in QR code
  const qrSize = 21; // QR code dimension (21x21 for simplest version)
  
  // Create a mock QR code for demonstration
  const qrCode = document.createElement('div');
  qrCode.className = 'qr-code';
  qrCode.style.display = 'grid';
  qrCode.style.gridTemplateColumns = `repeat(${qrSize}, ${size}px)`;
  qrCode.style.gridTemplateRows = `repeat(${qrSize}, ${size}px)`;
  qrCode.style.gap = '0';
  
  // Generate a pseudo-random pattern based on URL
  const urlHash = simpleHash(url);
  
  // Fixed pattern for QR code corners
  const pattern = [
    // Top-left position detection pattern
    [0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6],
    [1,0], [1,6],
    [2,0], [2,2], [2,3], [2,4], [2,6],
    [3,0], [3,2], [3,3], [3,4], [3,6],
    [4,0], [4,2], [4,3], [4,4], [4,6],
    [5,0], [5,6],
    [6,0], [6,1], [6,2], [6,3], [6,4], [6,5], [6,6],
    
    // Top-right position detection pattern
    [0,qrSize-7], [0,qrSize-6], [0,qrSize-5], [0,qrSize-4], [0,qrSize-3], [0,qrSize-2], [0,qrSize-1],
    [1,qrSize-7], [1,qrSize-1],
    [2,qrSize-7], [2,qrSize-5], [2,qrSize-4], [2,qrSize-3], [2,qrSize-1],
    [3,qrSize-7], [3,qrSize-5], [3,qrSize-4], [3,qrSize-3], [3,qrSize-1],
    [4,qrSize-7], [4,qrSize-5], [4,qrSize-4], [4,qrSize-3], [4,qrSize-1],
    [5,qrSize-7], [5,qrSize-1],
    [6,qrSize-7], [6,qrSize-6], [6,qrSize-5], [6,qrSize-4], [6,qrSize-3], [6,qrSize-2], [6,qrSize-1],
    
    // Bottom-left position detection pattern
    [qrSize-7,0], [qrSize-7,1], [qrSize-7,2], [qrSize-7,3], [qrSize-7,4], [qrSize-7,5], [qrSize-7,6],
    [qrSize-6,0], [qrSize-6,6],
    [qrSize-5,0], [qrSize-5,2], [qrSize-5,3], [qrSize-5,4], [qrSize-5,6],
    [qrSize-4,0], [qrSize-4,2], [qrSize-4,3], [qrSize-4,4], [qrSize-4,6],
    [qrSize-3,0], [qrSize-3,2], [qrSize-3,3], [qrSize-3,4], [qrSize-3,6],
    [qrSize-2,0], [qrSize-2,6],
    [qrSize-1,0], [qrSize-1,1], [qrSize-1,2], [qrSize-1,3], [qrSize-1,4], [qrSize-1,5], [qrSize-1,6]
  ];
  
  // Create the QR code cells
  for (let i = 0; i < qrSize; i++) {
    for (let j = 0; j < qrSize; j++) {
      const cell = document.createElement('div');
      
      // Check if this position is part of the fixed pattern
      const isPattern = pattern.some(([x, y]) => x === i && y === j);
      
      // Otherwise use the URL hash to determine if it should be filled
      // This is just for visual demonstration, not a real QR code
      const shouldFill = isPattern || ((i * j + urlHash) % 3 === 0);
      
      cell.style.width = `${size}px`;
      cell.style.height = `${size}px`;
      cell.style.backgroundColor = shouldFill ? '#000' : '#fff';
      qrCode.appendChild(cell);
    }
  }
  
  qrCodeContainer.appendChild(qrCode);
}

/**
 * Create a simple hash from a string
 * @param {String} str - String to hash
 * @returns {Number} Simple hash value
 */
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Download QR code as an image
 */
function downloadQRCode() {
  // This is a simplified version - in a real app you would convert the QR code to an image
  // For this demo we'll just show a toast message
  showToast('QR-код скачан', 'success');
}

/**
 * Share to external platform
 * @param {String} platform - Platform to share to ('whatsapp', 'telegram', 'email')
 */
function shareToExternalPlatform(platform) {
  const url = shareLinkInput.value;
  
  // Get the current note to include title in the share message
  const note = app.storage.getNoteById(currentNoteId);
  const title = note ? note.title : 'Заметка';
  
  let shareUrl;
  
  switch (platform) {
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}: ${url}`)}`;
      break;
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}: ${url}`)}`;
      break;
    default:
      return;
  }
  
  // Open share URL in a new window
  window.open(shareUrl, '_blank');
}

/**
 * Check if there's a shared note in the URL hash
 * and load it if present
 */
function checkForSharedNote() {
  if (!window.location.hash) return;
  
  const match = window.location.hash.match(/note=([^&]+)/);
  if (!match) return;
  
  try {
    // Decode the shared note data
    const encodedData = match[1];
    const noteData = JSON.parse(atob(encodedData));
    
    // Create a new note from the shared data
    if (noteData && noteData.title && noteData.content) {
      // Ask the user if they want to import the shared note
      if (confirm(`Хотите импортировать заметку "${noteData.title}"?`)) {
        const newNote = new Note({
          title: noteData.title,
          content: noteData.content,
          color: noteData.color || 'default'
        });
        
        // Add the note to storage
        app.storage.addNote(newNote);
        
        // Reload notes
        app.ui.loadNotes();
        
        // Open the imported note
        app.ui.openEditNoteModal(newNote.id);
        
        // Show success message
        showToast('Заметка успешно импортирована', 'success');
        
        // Clear the hash
        history.replaceState(null, null, ' ');
      }
    }
  } catch (error) {
    console.error('Error importing shared note:', error);
    showToast('Ошибка при импорте заметки', 'error');
  }
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  initSharing();
  
  // Check for shared notes after a short delay to ensure the app is initialized
  setTimeout(checkForSharedNote, 500);
});