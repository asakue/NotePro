
/**
 * NotePro - Enhanced Notes App
 * Main Application Script
 */

// Import theme manager
import './js/theme.js';

/**
 * Main application class
 */
class NotesApp {
  constructor() {
    this.storage = new NotesStorage();
    this.currentNoteId = null;
    this.activeFilters = [];
    this.viewMode = localStorage.getItem('notepro-view-mode') || 'grid';
    this.themeManager = new ThemeManager();
    
    // DOM Elements
    this.notesContainer = document.getElementById('notes');
    this.addNoteButton = document.getElementById('addNote');
    this.searchInput = document.getElementById('searchNotes');
    this.clearSearchButton = document.getElementById('clearSearch');
    this.sortSelect = document.getElementById('sortNotes');
    this.noteModal = document.getElementById('noteModal');
    this.modalNoteTitle = document.getElementById('modalNoteTitle');
    this.noteContent = document.getElementById('noteContent');
    this.saveNoteButton = document.getElementById('saveNote');
    this.closeModalButton = document.getElementById('closeModal');
    this.deleteNoteButton = document.getElementById('deleteNote');
    this.pinNoteButton = document.getElementById('pinNote');
    this.tagInput = document.getElementById('tagInput');
    this.addTagButton = document.getElementById('addTag');
    this.tagsContainer = document.getElementById('tagsContainer');
    this.suggestedTags = document.getElementById('suggestedTags');
    this.noteStats = document.getElementById('noteStats');
    this.wordCount = document.getElementById('wordCount');
    this.charCount = document.getElementById('charCount');
    this.readingTime = document.getElementById('readingTime');
    this.activeFiltersContainer = document.getElementById('activeFilters');
    this.tagsList = document.getElementById('tagsList');
    this.gridViewButton = document.getElementById('gridView');
    this.listViewButton = document.getElementById('listView');
    this.toggleSidebarButton = document.getElementById('toggleSidebar');
    this.sidebar = document.querySelector('.sidebar');
    this.mainContent = document.querySelector('.main-content');
    this.shareNoteButton = document.getElementById('shareNote');
    this.shareModal = document.getElementById('shareModal');
    this.closeShareModal = document.getElementById('closeShareModal');
    this.shareLink = document.getElementById('shareLink');
    this.copyShareLink = document.getElementById('copyShareLink');
    this.reminderNoteButton = document.getElementById('reminderNote');
    this.reminderModal = document.getElementById('reminderModal');
    this.closeReminderModal = document.getElementById('closeReminderModal');
    this.saveReminderButton = document.getElementById('saveReminder');
    this.reminderDate = document.getElementById('reminderDate');
    this.reminderTime = document.getElementById('reminderTime');
    this.exportNotesButton = document.getElementById('exportNotes');
    this.importNotesButton = document.getElementById('importNotes');
    this.importFile = document.getElementById('importFile');
    this.clearAllNotesButton = document.getElementById('clearAllNotes');
    
    // Rich text toolbar buttons
    this.richTextToolbar = document.getElementById('richTextToolbar');
    
    // Color options
    this.colorOptions = document.querySelectorAll('.color-option');
    
    // Initialize event listeners
    this.initEventListeners();
    
    // Initialize rich text editor
    this.initRichTextEditor();
    
    // Initialize theme
    this.themeManager.init();
    
    // Render notes
    this.renderNotes();
    
    // Update sidebar tags list
    this.updateTagsList();
    
    // Set initial view mode
    this.applyViewMode();
    
    // Check for shared note in URL
    this.checkForSharedNote();
    
    // Check reminders
    this.checkReminders();
    setInterval(() => this.checkReminders(), 60000); // Check every minute
  }
  
  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Add note button
    this.addNoteButton.addEventListener('click', () => this.openAddNoteModal());
    
    // Search input
    this.searchInput.addEventListener('input', debounce(() => this.filterNotes(), 300));
    
    // Clear search button
    this.clearSearchButton.addEventListener('click', () => this.clearSearch());
    
    // Sort select
    this.sortSelect.addEventListener('change', () => this.sortNotes());
    
    // Save note button
    this.saveNoteButton.addEventListener('click', () => this.saveNoteFromModal());
    
    // Close modal button
    this.closeModalButton.addEventListener('click', () => this.closeModal());
    
    // Delete note button
    this.deleteNoteButton.addEventListener('click', () => this.deleteNoteFromModal());
    
    // Pin note button
    this.pinNoteButton.addEventListener('click', () => this.toggleNotePin());
    
    // Add tag button
    this.addTagButton.addEventListener('click', () => this.addTagFromInput());
    
    // Tag input enter key
    this.tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addTagFromInput();
      }
    });
    
    // Note content (for stats updates)
    this.noteContent.addEventListener('input', debounce(() => {
      const text = this.noteContent.innerText;
      this.updateNoteStats(text);
      this.suggestTagsForContent(text);
    }, 500));
    
    // Grid/List view toggle
    this.gridViewButton.addEventListener('click', () => this.changeViewMode('grid'));
    this.listViewButton.addEventListener('click', () => this.changeViewMode('list'));
    
    // Toggle sidebar
    this.toggleSidebarButton.addEventListener('click', () => this.toggleSidebar());
    
    // Filter options
    document.querySelectorAll('.filter-option').forEach(option => {
      option.addEventListener('click', () => {
        const filter = option.dataset.filter;
        this.toggleFilter(filter);
        this.filterNotes();
      });
    });
    
    // Color options
    this.colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.selectNoteColor(option.dataset.color);
      });
    });
    
    // Share note
    this.shareNoteButton.addEventListener('click', () => this.openShareModal());
    this.closeShareModal.addEventListener('click', () => {
      this.shareModal.classList.remove('show');
    });
    this.copyShareLink.addEventListener('click', () => this.copyShareLinkToClipboard());
    
    // Share to external platforms
    document.querySelectorAll('.share-option').forEach(option => {
      option.addEventListener('click', () => {
        this.shareToExternalPlatform(option.dataset.platform);
      });
    });
    
    // Reminder
    this.reminderNoteButton.addEventListener('click', () => this.openReminderModal());
    this.closeReminderModal.addEventListener('click', () => {
      this.reminderModal.classList.remove('show');
    });
    this.saveReminderButton.addEventListener('click', () => this.saveReminder());
    
    // Export/Import notes
    this.exportNotesButton.addEventListener('click', () => this.exportNotes());
    this.importNotesButton.addEventListener('click', () => {
      this.importFile.click();
    });
    this.importFile.addEventListener('change', (e) => this.importNotes(e));
    
    // Clear all notes
    this.clearAllNotesButton.addEventListener('click', () => this.clearAllNotes());
    
    // Modal click prevention (stop propagation)
    document.querySelectorAll('.modal-content').forEach(content => {
      content.addEventListener('click', (e) => e.stopPropagation());
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', () => {
        modal.classList.remove('show');
      });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Close modal on Escape key
      if (e.key === 'Escape' && this.noteModal.classList.contains('show')) {
        this.closeModal();
      }
      
      // Ctrl+S to save note
      if (e.ctrlKey && e.key === 's' && this.noteModal.classList.contains('show')) {
        e.preventDefault();
        this.saveNoteFromModal();
      }
      
      // Ctrl+N to add new note
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        this.openAddNoteModal();
      }
    });
  }
  
  /**
   * Initialize rich text editor
   */
  initRichTextEditor() {
    this.richTextToolbar.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        const command = button.dataset.command;
        
        if (command === 'createLink') {
          const url = prompt('Enter the link URL:');
          if (url) {
            document.execCommand(command, false, url);
          }
        } else {
          document.execCommand(command, false, null);
        }
        
        // Update button states
        this.updateButtonStates();
        
        // Update note stats after command execution
        const text = this.noteContent.innerText;
        this.updateNoteStats(text);
      });
    });
    
    // Track selection changes to update button states
    this.noteContent.addEventListener('mouseup', () => this.updateButtonStates());
    this.noteContent.addEventListener('keyup', () => this.updateButtonStates());
  }
  
  /**
   * Update rich text button states based on current selection
   */
  updateButtonStates() {
    this.richTextToolbar.querySelectorAll('button').forEach(button => {
      const command = button.dataset.command;
      
      if (command === 'createLink' || command === 'unlink') {
        // Special case for links
        const hasLinkInSelection = document.queryCommandState('createLink');
        if (command === 'createLink') {
          button.classList.toggle('active', hasLinkInSelection);
        } else if (command === 'unlink') {
          button.disabled = !hasLinkInSelection;
          button.classList.toggle('active', hasLinkInSelection);
        }
      } else {
        // For all other commands, check their state
        button.classList.toggle('active', document.queryCommandState(command));
      }
    });
  }
  
  /**
   * Update note statistics
   * @param {String} text - Text to analyze
   */
  updateNoteStats(text) {
    if (!text) text = '';
    
    const words = countWords(text);
    const chars = countCharacters(text);
    const { minutes, seconds } = getReadingTime(text);
    
    this.wordCount.textContent = `${words} words`;
    this.charCount.textContent = `${chars} characters`;
    this.readingTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} min read`;
  }
  
  /**
   * Suggest tags based on content
   * @param {String} content - Note content
   */
  suggestTagsForContent(content) {
    if (!content) {
      this.suggestedTags.innerHTML = '';
      return;
    }
    
    const existingTags = Array.from(this.tagsContainer.querySelectorAll('.modal-tag')).map(
      tagEl => tagEl.textContent.trim().replace('×', '').toLowerCase()
    );
    
    // Get tags from content
    const suggestedTags = suggestTags(content, existingTags);
    
    // Display suggested tags
    this.suggestedTags.innerHTML = '';
    suggestedTags.forEach(tag => {
      const tagEl = document.createElement('div');
      tagEl.className = 'suggested-tag';
      tagEl.textContent = tag;
      tagEl.addEventListener('click', () => {
        this.addTagToModal(tag);
      });
      this.suggestedTags.appendChild(tagEl);
    });
  }
  
  /**
   * Open modal to add a new note
   */
  openAddNoteModal() {
    this.currentNoteId = null;
    this.modalNoteTitle.value = '';
    this.noteContent.innerHTML = '';
    this.tagsContainer.innerHTML = '';
    this.suggestedTags.innerHTML = '';
    this.selectNoteColor('default');
    this.pinNoteButton.innerHTML = '<i class="fas fa-thumbtack"></i>';
    this.pinNoteButton.classList.remove('active');
    this.updateNoteStats('');
    this.noteModal.classList.add('show');
    this.modalNoteTitle.focus();
  }
  
  /**
   * Open modal to edit an existing note
   * @param {Number} noteId - ID of the note to edit
   */
  openEditNoteModal(noteId) {
    const note = this.storage.getNoteById(noteId);
    if (!note) return;
    
    this.currentNoteId = note.id;
    this.modalNoteTitle.value = note.title;
    this.noteContent.innerHTML = note.content;
    this.selectNoteColor(note.color);
    
    // Set pin state
    this.pinNoteButton.classList.toggle('active', note.pinned);
    this.pinNoteButton.innerHTML = note.pinned 
      ? '<i class="fas fa-thumbtack" style="color: var(--secondary-color);"></i>' 
      : '<i class="fas fa-thumbtack"></i>';
    
    // Reset tags
    this.tagsContainer.innerHTML = '';
    
    // Add tags
    note.tags.forEach(tag => {
      this.addTagToModal(tag);
    });
    
    // Update stats
    this.updateNoteStats(note.getPlainTextContent());
    
    // Suggest tags based on content
    this.suggestTagsForContent(note.getPlainTextContent());
    
    // Show modal
    this.noteModal.classList.add('show');
    this.modalNoteTitle.focus();
  }
  
  /**
   * Close the note modal
   */
  closeModal() {
    this.noteModal.classList.remove('show');
  }
  
  /**
   * Save note from modal data
   */
  saveNoteFromModal() {
    const title = this.modalNoteTitle.value.trim() || 'Untitled Note';
    const content = this.noteContent.innerHTML;
    const color = this.getSelectedColor();
    const tags = Array.from(this.tagsContainer.querySelectorAll('.modal-tag')).map(
      tagEl => tagEl.textContent.trim().replace('×', '').toLowerCase()
    );
    const pinned = this.pinNoteButton.classList.contains('active');
    
    if (this.currentNoteId) {
      // Update existing note
      const note = this.storage.getNoteById(this.currentNoteId);
      if (note) {
        note.update({
          title,
          content,
          color,
          tags,
          pinned
        });
        this.storage.updateNote(note);
      }
    } else {
      // Create new note
      const note = new Note({
        title,
        content,
        color,
        tags,
        pinned
      });
      this.storage.addNote(note);
    }
    
    this.closeModal();
    this.renderNotes();
    this.updateTagsList();
    this.showToast('Note saved successfully', 'success');
  }
  
  /**
   * Delete note from modal
   */
  deleteNoteFromModal() {
    if (!this.currentNoteId) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
      this.storage.deleteNote(this.currentNoteId);
      this.closeModal();
      this.renderNotes();
      this.updateTagsList();
      this.showToast('Note deleted', 'success');
    }
  }
  
  /**
   * Toggle note pin status
   */
  toggleNotePin() {
    this.pinNoteButton.classList.toggle('active');
    
    if (this.pinNoteButton.classList.contains('active')) {
      this.pinNoteButton.innerHTML = '<i class="fas fa-thumbtack" style="color: var(--secondary-color);"></i>';
    } else {
      this.pinNoteButton.innerHTML = '<i class="fas fa-thumbtack"></i>';
    }
  }
  
  /**
   * Add a tag from the input field
   */
  addTagFromInput() {
    const tag = this.tagInput.value.trim();
    if (!tag) return;
    
    this.addTagToModal(tag);
    this.tagInput.value = '';
    this.tagInput.focus();
  }
  
  /**
   * Add a tag to the modal
   * @param {String} tag - Tag to add
   */
  addTagToModal(tag) {
    // Check if tag already exists
    const existingTags = Array.from(this.tagsContainer.querySelectorAll('.modal-tag')).map(
      tagEl => tagEl.textContent.trim().replace('×', '').toLowerCase()
    );
    
    if (existingTags.includes(tag.toLowerCase())) return;
    
    const tagElement = document.createElement('div');
    tagElement.className = 'modal-tag';
    tagElement.innerHTML = `
      ${tag}
      <button class="remove-tag">×</button>
    `;
    
    const removeButton = tagElement.querySelector('.remove-tag');
    removeButton.addEventListener('click', () => {
      tagElement.remove();
    });
    
    this.tagsContainer.appendChild(tagElement);
  }
  
  /**
   * Get selected color in modal
   * @returns {String} Color name
   */
  getSelectedColor() {
    const selectedColorOption = document.querySelector('.color-option.selected');
    return selectedColorOption ? selectedColorOption.dataset.color : 'default';
  }
  
  /**
   * Select a note color
   * @param {String} color - Color to select
   */
  selectNoteColor(color) {
    this.colorOptions.forEach(option => {
      option.classList.toggle('selected', option.dataset.color === color);
    });
  }
  
  /**
   * Filter notes based on search and active filters
   */
  filterNotes() {
    const searchTerm = this.searchInput.value.toLowerCase();
    let filteredNotes = this.storage.notes;
    
    // Show/hide clear button based on search input
    this.clearSearchButton.classList.toggle('visible', searchTerm.length > 0);
    
    // Filter by search term
    if (searchTerm) {
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) || 
        note.getPlainTextContent().toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply tag filters
    const tagFilters = this.activeFilters.filter(filter => !['all', 'pinned', 'recent'].includes(filter));
    if (tagFilters.length > 0) {
      filteredNotes = filteredNotes.filter(note => 
        tagFilters.some(tag => note.tags.includes(tag))
      );
    }
    
    // Apply special filters
    if (this.activeFilters.includes('pinned')) {
      filteredNotes = filteredNotes.filter(note => note.pinned);
    }
    
    if (this.activeFilters.includes('recent')) {
      // Get notes from the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      filteredNotes = filteredNotes.filter(note => 
        new Date(note.updated) > threeDaysAgo
      );
    }
    
    // Update active filters display
    this.renderActiveFilters();
    
    // Render filtered notes
    this.renderNotes(filteredNotes);
  }
  
  /**
   * Clear search input
   */
  clearSearch() {
    this.searchInput.value = '';
    this.clearSearchButton.classList.remove('visible');
    this.filterNotes();
  }
  
  /**
   * Toggle a filter
   * @param {String} filter - Filter to toggle
   */
  toggleFilter(filter) {
    // Handle special cases for mutually exclusive filters
    if (filter === 'all') {
      this.activeFilters = [];
    } else if (this.activeFilters.includes(filter)) {
      this.activeFilters = this.activeFilters.filter(f => f !== filter);
    } else {
      this.activeFilters.push(filter);
    }
    
    // Update filter option styling
    document.querySelectorAll('.filter-option').forEach(option => {
      const isAll = option.dataset.filter === 'all';
      const isActive = isAll 
        ? this.activeFilters.length === 0 
        : this.activeFilters.includes(option.dataset.filter);
      
      option.classList.toggle('active', isActive);
    });
  }
  
  /**
   * Toggle a tag in the filter list
   * @param {String} tag - Tag to toggle
   */
  toggleTagFilter(tag) {
    if (this.activeFilters.includes(tag)) {
      this.activeFilters = this.activeFilters.filter(f => f !== tag);
    } else {
      this.activeFilters.push(tag);
    }
    
    this.filterNotes();
  }
  
  /**
   * Render active filters
   */
  renderActiveFilters() {
    this.activeFiltersContainer.innerHTML = '';
    
    if (this.activeFilters.length === 0) return;
    
    this.activeFilters.forEach(filter => {
      // Skip special filters for the active filters display
      if (['all', 'recent', 'pinned'].includes(filter)) return;
      
      const filterElement = document.createElement('div');
      filterElement.className = 'active-filter';
      filterElement.innerHTML = `
        ${filter}
        <button class="remove-filter">×</button>
      `;
      
      const removeButton = filterElement.querySelector('.remove-filter');
      removeButton.addEventListener('click', () => {
        this.toggleTagFilter(filter);
      });
      
      this.activeFiltersContainer.appendChild(filterElement);
    });
  }
  
  /**
   * Sort notes based on selected option
   */
  sortNotes() {
    const sortType = this.sortSelect.value;
    this.renderNotes(this.sortNotesByType(this.storage.notes, sortType));
  }
  
  /**
   * Sort array of notes by type
   * @param {Array} notes - Notes to sort
   * @param {String} sortType - Sort type
   * @returns {Array} Sorted notes
   */
  sortNotesByType(notes, sortType = 'updated') {
    // Create a copy to avoid modifying original array
    const sortedNotes = [...notes];
    
    switch (sortType) {
      case 'updated':
        sortedNotes.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        break;
      case 'created':
        sortedNotes.sort((a, b) => new Date(b.created) - new Date(a.created));
        break;
      case 'title':
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    // Always put pinned notes at the top
    sortedNotes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    
    return sortedNotes;
  }
  
  /**
   * Render notes to the DOM
   * @param {Array} notesToRender - Notes to render (optional)
   */
  renderNotes(notesToRender = null) {
    this.notesContainer.innerHTML = '';
    
    const notes = notesToRender || this.storage.notes;
    const sortedNotes = this.sortNotesByType(notes, this.sortSelect.value);
    
    if (sortedNotes.length === 0) {
      this.notesContainer.innerHTML = `
        <div class="empty-notes">
          <i class="fas fa-sticky-note" style="font-size: 48px; color: var(--text-light); margin-bottom: 15px;"></i>
          <p>No notes found</p>
          <button id="emptyAddNote" class="add-button" style="margin-top: 15px; width: auto; height: auto; padding: 10px 20px;">
            <i class="fas fa-plus"></i> Add Note
          </button>
        </div>
      `;
      
      const emptyAddButton = document.getElementById('emptyAddNote');
      if (emptyAddButton) {
        emptyAddButton.addEventListener('click', () => this.openAddNoteModal());
      }
      
      return;
    }
    
    sortedNotes.forEach(note => this.renderNote(note));
  }
  
  /**
   * Render a single note
   * @param {Note} note - Note to render
   */
  renderNote(note) {
    const noteElement = document.createElement('div');
    noteElement.className = `note ${note.color}`;
    
    // Format the note content for display (truncate if needed)
    const plainText = note.getPlainTextContent();
    const displayText = plainText.length > 150 
      ? plainText.substring(0, 150) + '...' 
      : plainText;
    
    noteElement.innerHTML = `
      <div class="note-color-bar ${note.color}"></div>
      <div class="note-content">
        <div class="note-header">
          <div class="note-title">${sanitizeHtml(note.title)}</div>
          <div class="note-pin ${note.pinned ? 'pinned' : ''}">
            <i class="fas fa-thumbtack"></i>
          </div>
        </div>
        <div class="note-text">${sanitizeHtml(displayText)}</div>
      </div>
      <div class="note-footer">
        <div class="note-tags">
          ${note.tags.map(tag => `<div class="note-tag">${sanitizeHtml(tag)}</div>`).join('')}
        </div>
        <div>${note.getFormattedDate('updated')}</div>
      </div>
    `;
    
    // Add click event to open note
    noteElement.addEventListener('click', () => {
      this.openEditNoteModal(note.id);
    });
    
    // Special handling for pin button
    const pinButton = noteElement.querySelector('.note-pin');
    pinButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent opening the note
      this.toggleNotePinInList(note.id, pinButton);
    });
    
    this.notesContainer.appendChild(noteElement);
  }
  
  /**
   * Toggle pin status from the note list
   * @param {Number} noteId - ID of the note
   * @param {HTMLElement} pinElement - Pin element to update
   */
  toggleNotePinInList(noteId, pinElement) {
    const note = this.storage.getNoteById(noteId);
    if (!note) return;
    
    note.togglePin();
    this.storage.updateNote(note);
    
    pinElement.classList.toggle('pinned', note.pinned);
    
    // Re-render to ensure proper order with pinned notes at the top
    this.renderNotes();
    
    this.showToast(note.pinned ? 'Note pinned' : 'Note unpinned', 'success');
  }
  
  /**
   * Update tags list in sidebar
   */
  updateTagsList() {
    if (!this.tagsList) return;
    
    this.tagsList.innerHTML = '';
    
    // Get all tags from notes with counts
    const tagCounts = getAllTags(this.storage.notes);
    
    // Sort tags
    const sortedTags = Object.entries(tagCounts).sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedTags.forEach(([tag, count]) => {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag-item';
      tagElement.innerHTML = `
        <span>${tag}</span>
        <span class="tag-count">${count}</span>
      `;
      
      tagElement.addEventListener('click', () => {
        this.toggleTagFilter(tag);
      });
      
      this.tagsList.appendChild(tagElement);
    });
    
    // Show message if no tags
    if (sortedTags.length === 0) {
      this.tagsList.innerHTML = '<div class="no-tags">No tags yet</div>';
    }
  }
  
  /**
   * Change the view mode (grid or list)
   * @param {String} mode - 'grid' or 'list'
   */
  changeViewMode(mode) {
    this.viewMode = mode;
    localStorage.setItem('notepro-view-mode', mode);
    
    this.applyViewMode();
  }
  
  /**
   * Apply the current view mode to the notes container
   */
  applyViewMode() {
    // Update buttons
    this.gridViewButton.classList.toggle('active', this.viewMode === 'grid');
    this.listViewButton.classList.toggle('active', this.viewMode === 'list');
    
    // Update container class
    this.notesContainer.className = this.viewMode === 'grid' ? 'notes-grid' : 'notes-list';
  }
  
  /**
   * Toggle sidebar visibility
   */
  toggleSidebar() {
    this.sidebar.classList.toggle('collapsed');
    this.mainContent.classList.toggle('expanded');
    
    // Add/remove overlay for mobile
    const existingOverlay = document.querySelector('.overlay');
    
    if (this.sidebar.classList.contains('collapsed')) {
      if (existingOverlay) {
        existingOverlay.remove();
      }
    } else {
      if (!existingOverlay && window.innerWidth < 992) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay show';
        overlay.addEventListener('click', () => this.toggleSidebar());
        document.body.appendChild(overlay);
      }
    }
  }
  
  /**
   * Open share modal for a note
   */
  openShareModal() {
    if (!this.currentNoteId) return;
    
    const note = this.storage.getNoteById(this.currentNoteId);
    if (!note) return;
    
    // Generate share URL
    const shareUrl = createShareUrl(note);
    this.shareLink.value = shareUrl;
    
    // Generate QR code
    generateQRCode(shareUrl);
    
    // Show modal
    this.shareModal.classList.add('show');
  }
  
  /**
   * Copy share link to clipboard
   */
  copyShareLinkToClipboard() {
    this.shareLink.select();
    document.execCommand('copy');
    this.showToast('Link copied to clipboard', 'success');
  }
  
  /**
   * Share to external platform
   * @param {String} platform - Platform to share to
   */
  shareToExternalPlatform(platform) {
    if (!this.currentNoteId) return;
    
    const note = this.storage.getNoteById(this.currentNoteId);
    if (!note) return;
    
    const shareUrl = this.shareLink.value;
    const shareText = `${note.title} - ${note.getPlainTextContent().substring(0, 100)}...`;
    
    let externalUrl;
    
    switch (platform) {
      case 'whatsapp':
        externalUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        externalUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        externalUrl = `mailto:?subject=${encodeURIComponent(note.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }
    
    if (externalUrl) {
      window.open(externalUrl, '_blank');
    }
  }
  
  /**
   * Open reminder modal
   */
  openReminderModal() {
    if (!this.currentNoteId) return;
    
    // Set default reminder time (15 minutes from now)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    
    this.reminderDate.value = dateStr;
    this.reminderTime.value = timeStr;
    
    // Show modal
    this.reminderModal.classList.add('show');
  }
  
  /**
   * Save reminder
   */
  saveReminder() {
    if (!this.currentNoteId) return;
    
    const note = this.storage.getNoteById(this.currentNoteId);
    if (!note) return;
    
    const dateStr = this.reminderDate.value;
    const timeStr = this.reminderTime.value;
    
    if (!dateStr || !timeStr) {
      this.showToast('Please select date and time', 'error');
      return;
    }
    
    const reminderDate = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    
    if (reminderDate <= now) {
      this.showToast('Reminder time must be in the future', 'error');
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
    this.reminderModal.classList.remove('show');
    this.showToast('Reminder set successfully', 'success');
  }
  
  /**
   * Check for pending reminders
   */
  checkReminders() {
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
  }
  
  /**
   * Export notes to JSON file
   */
  exportNotes() {
    const jsonData = this.storage.exportNotes();
    downloadFile(jsonData, 'notes-backup.json', 'application/json');
    this.showToast('Notes exported successfully', 'success');
  }
  
  /**
   * Import notes from JSON file
   * @param {Event} event - File input change event
   */
  importNotes(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = this.storage.importNotes(e.target.result);
        if (result.success) {
          this.renderNotes();
          this.updateTagsList();
          this.showToast(result.message, 'success');
        } else {
          this.showToast(result.message, 'error');
        }
      } catch (error) {
        this.showToast('Failed to import notes', 'error');
        console.error('Import error:', error);
      }
      
      // Clear the input
      event.target.value = '';
    };
    
    reader.readAsText(file);
  }
  
  /**
   * Clear all notes
   */
  clearAllNotes() {
    if (confirm('Are you sure you want to delete all notes? This action cannot be undone.')) {
      this.storage.clearAllNotes();
      this.renderNotes();
      this.updateTagsList();
      this.showToast('All notes have been deleted', 'success');
    }
  }
  
  /**
   * Check if there's a shared note in the URL
   */
  checkForSharedNote() {
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
      
      // Open in edit mode first so user can save if they want
      this.modalNoteTitle.value = note.title;
      this.noteContent.innerHTML = note.content;
      this.selectNoteColor(note.color);
      
      // Add tags
      this.tagsContainer.innerHTML = '';
      note.tags.forEach(tag => {
        this.addTagToModal(tag);
      });
      
      // Update stats
      this.updateNoteStats(note.getPlainTextContent());
      
      // Show modal
      this.noteModal.classList.add('show');
      
      // Show toast notification
      this.showToast('Shared note opened. Save to keep it.', 'info');
      
      // Clear the hash to prevent reopening on refresh
      history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      console.error('Error parsing shared note:', error);
      this.showToast('Invalid shared note data', 'error');
    }
  }
  
  /**
   * Show a toast notification
   * @param {String} message - Message to display
   * @param {String} type - 'success', 'error', or 'warning'
   */
  showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon;
    switch (type) {
      case 'success':
        icon = 'check-circle';
        break;
      case 'error':
        icon = 'exclamation-circle';
        break;
      case 'warning':
        icon = 'exclamation-triangle';
        break;
      case 'info':
        icon = 'info-circle';
        break;
      default:
        icon = 'info-circle';
    }
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${icon}"></i>
      </div>
      <div class="toast-content">${message}</div>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add close functionality
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
      toast.classList.add('closing');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('closing');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, 5000);
  }
}

// Helper functions for counting words and characters
function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function countCharacters(text) {
  return text.length;
}

// Helper function for reading time
function getReadingTime(text, wordsPerMinute = 200) {
  const words = countWords(text);
  const minutes = Math.floor(words / wordsPerMinute);
  const seconds = Math.floor((words % wordsPerMinute) / (wordsPerMinute / 60));
  return { minutes, seconds };
}

// Helper functions for tags
function getAllTags(notes) {
  const tagCounts = {};
  
  notes.forEach(note => {
    note.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return tagCounts;
}

function suggestTags(content, existingTags = []) {
  if (!content) return [];
  
  // Get words from content
  const words = content.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove punctuation, keep Unicode letters and numbers
    .split(/\s+/)
    .filter(word => word.length > 3) // Only words longer than 3 chars
    .filter(word => !['this', 'that', 'with', 'from', 'have', 'should', 'would', 'could', 'about'].includes(word));
  
  // Count words
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Get top words
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0])
    .filter(word => !existingTags.includes(word));
  
  return topWords;
}

// Sharing functions
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

function generateQRCode(url) {
  const qrCodeContainer = document.getElementById('qrCode');
  if (!qrCodeContainer) return;
  
  // Clear previous QR code
  qrCodeContainer.innerHTML = '';
  
  // Use a simple API to generate QR code as fallback
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  const qrImage = document.createElement('img');
  qrImage.src = qrImageUrl;
  qrImage.alt = 'QR Code';
  qrImage.style.maxWidth = '100%';
  
  qrCodeContainer.appendChild(qrImage);
  
  // Add download handler
  const downloadButton = document.getElementById('downloadQR');
  if (downloadButton) {
    downloadButton.onclick = () => {
      const link = document.createElement('a');
      link.href = qrImageUrl;
      link.download = 'note-qr-code.png';
      link.click();
    };
  }
}

// Reminder functions
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

function getRemindersFromStorage() {
  const remindersJson = localStorage.getItem('notepro-reminders');
  return remindersJson ? JSON.parse(remindersJson) : [];
}

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

function createNotification(reminder) {
  const notification = new Notification('Note Reminder', {
    body: reminder.noteTitle,
    icon: '/favicon.ico'
  });
  
  notification.onclick = () => {
    window.focus();
    // Find the note and open it
    const app = window.notesApp;
    if (app) {
      app.openEditNoteModal(reminder.noteId);
    }
  };
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.notesApp = new NotesApp();
});
