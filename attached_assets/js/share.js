/**
 * Sharing functionality for notes
 */

/**
 * Initialize sharing functionality
 */
function initSharing() {
  const shareNoteButton = document.getElementById('shareNote');
  const shareModal = document.getElementById('shareModal');
  const closeShareModal = document.getElementById('closeShareModal');
  const copyShareLink = document.getElementById('copyShareLink');
  const shareLink = document.getElementById('shareLink');
  const downloadQRButton = document.getElementById('downloadQR');
  
  if (shareNoteButton) {
    shareNoteButton.addEventListener('click', openShareModal);
  }
  
  if (closeShareModal) {
    closeShareModal.addEventListener('click', closeShareModal);
  }
  
  if (copyShareLink) {
    copyShareLink.addEventListener('click', copyShareLink);
  }
  
  if (downloadQRButton) {
    downloadQRButton.addEventListener('click', downloadQRCode);
  }
  
  // Share to external platforms
  document.querySelectorAll('.share-option').forEach(option => {
    option.addEventListener('click', () => {
      shareToExternalPlatform(option.dataset.platform);
    });
  });
  
  // Check for shared note in URL
  checkForSharedNote();
}

/**
 * Open share modal for a note
 */
function openShareModal() {
  const shareModal = document.getElementById('shareModal');
  const currentNoteId = window.notesApp.currentNoteId;
  
  if (!currentNoteId) return;
  
  const note = window.notesApp.storage.getNoteById(currentNoteId);
  if (!note) return;
  
  // Generate share URL
  const shareUrl = createShareUrl(note);
  document.getElementById('shareLink').value = shareUrl;
  
  // Generate QR code
  generateQRCode(shareUrl);
  
  // Show modal
  shareModal.classList.add('show');
}

/**
 * Close share modal
 */
function closeShareModal() {
  const shareModal = document.getElementById('shareModal');
  shareModal.classList.remove('show');
}

/**
 * Create a share URL for a note
 * @param {Note} note - The note to share
 * @returns {String} Share URL
 */
function createShareUrl(note) {
  // Create a simplified version of the note for sharing
  const shareData = {
    title: note.title,
    content: note.content,
    color: note.color,
    tags: note.tags
  };
  
  // Encode the data
  const encodedData = btoa(JSON.stringify(shareData));
  
  // Create the URL with the encoded data as a hash parameter
  return `${window.location.origin}${window.location.pathname}#share=${encodedData}`;
}

/**
 * Copy the share link to clipboard
 */
function copyShareLink() {
  const shareLink = document.getElementById('shareLink');
  shareLink.select();
  document.execCommand('copy');
  window.notesApp.showToast('Link copied to clipboard', 'success');
}

/**
 * Generate a QR code for the share URL
 * @param {String} url - URL to encode in QR
 */
function generateQRCode(url) {
  const qrCodeContainer = document.getElementById('qrCode');
  if (!qrCodeContainer) return;
  
  // Clear previous QR code
  qrCodeContainer.innerHTML = '';
  
  // Use a simple API to generate QR code
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  const qrImage = document.createElement('img');
  qrImage.src = qrImageUrl;
  qrImage.alt = 'QR Code';
  qrImage.style.maxWidth = '100%';
  
  qrCodeContainer.appendChild(qrImage);
}

/**
 * Create a simple hash from a string
 * @param {String} str - String to hash
 * @returns {Number} Simple hash value
 */
function simpleHash(str) {
  let hash = 0;
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
  const qrImage = document.querySelector('#qrCode img');
  if (!qrImage) return;
  
  const link = document.createElement('a');
  link.href = qrImage.src;
  link.download = 'note-qr-code.png';
  link.click();
}

/**
 * Share to external platform
 * @param {String} platform - Platform to share to ('whatsapp', 'telegram', 'email')
 */
function shareToExternalPlatform(platform) {
  const shareLink = document.getElementById('shareLink');
  if (!shareLink) return;
  
  const url = shareLink.value;
  const currentNoteId = window.notesApp.currentNoteId;
  
  if (!currentNoteId) return;
  
  const note = window.notesApp.storage.getNoteById(currentNoteId);
  if (!note) return;
  
  const shareText = `${note.title} - ${note.getPlainTextContent().substring(0, 100)}...`;
  
  let externalUrl;
  
  switch (platform) {
    case 'whatsapp':
      externalUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`;
      break;
    case 'telegram':
      externalUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
      break;
    case 'email':
      externalUrl = `mailto:?subject=${encodeURIComponent(note.title)}&body=${encodeURIComponent(shareText + '\n\n' + url)}`;
      break;
  }
  
  if (externalUrl) {
    window.open(externalUrl, '_blank');
  }
}

/**
 * Check if there's a shared note in the URL hash
 * and load it if present
 */
function checkForSharedNote() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#share=')) return;
  
  const encodedData = hash.substring(7);
  try {
    const noteData = JSON.parse(atob(encodedData));
    
    // Create a temporary note object
    const note = new Note({
      title: noteData.title,
      content: noteData.content,
      color: noteData.color || 'default',
      tags: noteData.tags || [],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    });
    
    // If notesApp is available, open in edit mode
    if (window.notesApp) {
      window.notesApp.modalNoteTitle.value = note.title;
      window.notesApp.noteContent.innerHTML = note.content;
      window.notesApp.selectNoteColor(note.color);
      
      // Add tags
      window.notesApp.tagsContainer.innerHTML = '';
      note.tags.forEach(tag => {
        window.notesApp.addTagToModal(tag);
      });
      
      // Update stats
      window.notesApp.updateNoteStats(note.getPlainTextContent());
      
      // Show modal
      window.notesApp.noteModal.classList.add('show');
      
      // Show toast notification
      window.notesApp.showToast('Shared note opened. Save to keep it.', 'info');
    }
    
    // Clear the hash to prevent reopening on refresh
    history.replaceState(null, '', window.location.pathname);
  } catch (error) {
    console.error('Error parsing shared note:', error);
    if (window.notesApp) {
      window.notesApp.showToast('Invalid shared note data', 'error');
    }
  }
}