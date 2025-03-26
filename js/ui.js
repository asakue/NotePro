/**
 * UI class - Manages user interface interactions
 */
class NotesUI {
  constructor(storage) {
    this.storage = storage;
    this.activeNoteId = null;
    this.viewMode = localStorage.getItem('view-mode') || 'grid';
    this.sortType = localStorage.getItem('sort-type') || 'updated';
    this.filterTags = [];
    this.searchText = '';
    
    // Setup DOM references
    this.notesContainer = document.getElementById('notes');
    this.noteModal = document.getElementById('noteModal');
    this.noNotesMessage = document.getElementById('noNotesMessage');
    this.noSearchResults = document.getElementById('noSearchResults');
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load notes
    this.loadNotes();
    
    // Set initial view mode
    this.changeViewMode(this.viewMode);
  }
  
  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Add new note
    const addNoteBtn = document.getElementById('addNote');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', () => this.openAddNoteModal());
    }
    
    // Close modal
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeModal());
    }
    
    // Save note
    const saveNoteBtn = document.getElementById('saveNote');
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', () => this.saveNoteFromModal());
    }
    
    // Delete note
    const deleteNoteBtn = document.getElementById('deleteNote');
    if (deleteNoteBtn) {
      deleteNoteBtn.addEventListener('click', () => this.deleteNoteFromModal());
    }
    
    // Search notes
    const searchInput = document.getElementById('searchNotes');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => this.filterNotes(), 300));
    }
    
    // Clear search
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => this.clearSearch());
    }
    
    // Sort notes
    const sortSelect = document.getElementById('sortNotes');
    if (sortSelect) {
      sortSelect.value = this.sortType;
      sortSelect.addEventListener('change', () => this.sortNotes());
    }
    
    // Toggle sidebar
    const menuToggleBtn = document.getElementById('menuToggle');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (menuToggleBtn && sidebar) {
      menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        if (mainContent) {
          mainContent.classList.add('sidebar-open');
        }
      });
    }
    
    if (toggleSidebarBtn && sidebar) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        if (mainContent) {
          mainContent.classList.remove('sidebar-open');
        }
      });
    }
    
    // View mode
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    
    if (gridViewBtn) {
      gridViewBtn.addEventListener('click', () => this.changeViewMode('grid'));
    }
    
    if (listViewBtn) {
      listViewBtn.addEventListener('click', () => this.changeViewMode('list'));
    }
    
    // Add tag from input
    const addTagBtn = document.getElementById('addTag');
    if (addTagBtn) {
      addTagBtn.addEventListener('click', () => this.addTagFromInput());
    }
    
    // Tag input enter key
    const tagInput = document.getElementById('noteTags');
    if (tagInput) {
      tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addTagFromInput();
        }
      });
    }
    
    // Handle modal clicks outside
    this.noteModal.addEventListener('click', (e) => {
      if (e.target === this.noteModal) {
        this.closeModal();
      }
    });
    
    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        colorOptions.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
  }
  
  /**
   * Load notes from storage
   */
  loadNotes() {
    // Get all notes
    const notes = this.storage.getNotes();
    
    // Sort notes
    this.sortNotesByType(notes, this.sortType);
    
    // Render all notes
    this.renderNotes(notes);
    
    // Update tags list in sidebar
    this.updateTagsList();
  }
  
  /**
   * Render notes to the DOM
   * @param {Array} notesToRender - Optional array of notes to render (filtered)
   */
  renderNotes(notesToRender = null) {
    // Clear container
    this.notesContainer.innerHTML = '';
    
    // Get notes to render
    const notes = notesToRender || this.storage.getNotes();
    
    // Separate pinned and unpinned notes
    const pinnedNotes = notes.filter(note => note.pinned);
    const unpinnedNotes = notes.filter(note => !note.pinned);
    
    // Sort both arrays
    this.sortNotesByType(pinnedNotes, this.sortType);
    this.sortNotesByType(unpinnedNotes, this.sortType);
    
    // Combine arrays with pinned notes first
    const sortedNotes = [...pinnedNotes, ...unpinnedNotes];
    
    // Show appropriate message if no notes
    if (sortedNotes.length === 0) {
      if (this.searchText || this.filterTags.length > 0) {
        this.noSearchResults.style.display = 'flex';
        this.noNotesMessage.style.display = 'none';
      } else {
        this.noNotesMessage.style.display = 'flex';
        this.noSearchResults.style.display = 'none';
      }
    } else {
      this.noNotesMessage.style.display = 'none';
      this.noSearchResults.style.display = 'none';
    }
    
    // Render each note
    sortedNotes.forEach(note => {
      this.renderNote(note);
    });
  }
  
  /**
   * Render a single note
   * @param {Note} note - The note to render
   */
  renderNote(note) {
    // Create note element
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.setAttribute('data-id', note.id);
    
    // Add color class if not default
    if (note.color !== 'default') {
      noteEl.classList.add(`note-color-${note.color}`);
    }
    
    // Add pinned class if pinned
    if (note.pinned) {
      noteEl.classList.add('pinned-note');
    }
    
    // Add list-item class if in list view
    if (this.viewMode === 'list') {
      noteEl.classList.add('note-list-item');
    }
    
    // Create note content
    noteEl.innerHTML = `
      <div class="note-header">
        <div class="note-title-wrapper">
          <h3 class="note-title">${note.title || 'Без названия'}</h3>
        </div>
        <div class="note-actions">
          <button class="note-button pin-button" title="${note.pinned ? 'Открепить' : 'Закрепить'}">
            <i class="fas ${note.pinned ? 'fa-thumbtack' : 'fa-thumbtack'}"></i>
          </button>
          <button class="note-button edit-button" title="Редактировать">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </div>
      <div class="note-content-preview">${note.content}</div>
      <div class="note-footer">
        <span class="note-date">${note.getFormattedDate('updated')}</span>
        <div class="note-tags">
          ${note.tags.slice(0, 3).map(tag => `<span class="note-tag">${tag}</span>`).join('')}
          ${note.tags.length > 3 ? `<span class="note-tag">+${note.tags.length - 3}</span>` : ''}
        </div>
      </div>
    `;
    
    // Add event listeners
    const editBtn = noteEl.querySelector('.edit-button');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openEditNoteModal(note.id);
    });
    
    const pinBtn = noteEl.querySelector('.pin-button');
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleNotePin(note.id);
    });
    
    // Click on note to edit
    noteEl.addEventListener('click', () => {
      this.openEditNoteModal(note.id);
    });
    
    // Add note to container
    this.notesContainer.appendChild(noteEl);
  }
  
  /**
   * Open modal to add a new note
   */
  openAddNoteModal() {
    // Reset active note
    this.activeNoteId = null;
    
    // Reset form
    document.getElementById('modalNoteTitle').value = '';
    document.getElementById('modalNoteContent').innerHTML = '';
    document.getElementById('pinNote').checked = false;
    document.getElementById('noteTagsList').innerHTML = '';
    
    // Reset color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));
    colorOptions[0].classList.add('selected'); // Default color
    
    // Reset stats
    updateNoteStats('');
    
    // Show modal
    this.noteModal.style.display = 'flex';
    
    // Focus on title
    setTimeout(() => {
      document.getElementById('modalNoteTitle').focus();
    }, 100);
  }
  
  /**
   * Open modal to edit an existing note
   * @param {Number} noteId - ID of the note to edit
   */
  openEditNoteModal(noteId) {
    // Get the note
    const note = this.storage.getNoteById(noteId);
    if (!note) return;
    
    // Set active note
    this.activeNoteId = noteId;
    
    // Set form values
    document.getElementById('modalNoteTitle').value = note.title;
    document.getElementById('modalNoteContent').innerHTML = note.content;
    document.getElementById('pinNote').checked = note.pinned;
    
    // Set color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));
    const selectedColor = document.querySelector(`.color-option[data-color="${note.color}"]`);
    if (selectedColor) {
      selectedColor.classList.add('selected');
    } else {
      colorOptions[0].classList.add('selected'); // Default color
    }
    
    // Set tags
    this.renderModalTags(note.tags);
    
    // Update stats
    updateNoteStats(note.getPlainTextContent());
    
    // Suggest tags based on content
    this.suggestTagsForContent(note.getPlainTextContent(), note.tags);
    
    // Show modal
    this.noteModal.style.display = 'flex';
  }
  
  /**
   * Suggest tags based on note content
   * @param {String} content - Note content
   * @param {Array} existingTags - Existing tags
   */
  suggestTagsForContent(content, existingTags) {
    const suggestedTagsList = document.getElementById('suggestedTagsList');
    if (!suggestedTagsList) return;
    
    // Clear previous suggestions
    suggestedTagsList.innerHTML = '';
    
    // Get suggested tags
    const suggestions = suggestTags(content, existingTags);
    
    if (suggestions.length === 0) {
      // Hide the container if no suggestions
      document.getElementById('suggestedTags').style.display = 'none';
      return;
    }
    
    // Show the container
    document.getElementById('suggestedTags').style.display = 'block';
    
    // Add suggested tags
    suggestions.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'suggested-tag';
      tagEl.textContent = tag;
      
      tagEl.addEventListener('click', () => {
        this.addTagToModal(tag);
        tagEl.remove();
        
        // Hide container if no more suggestions
        if (suggestedTagsList.children.length === 0) {
          document.getElementById('suggestedTags').style.display = 'none';
        }
      });
      
      suggestedTagsList.appendChild(tagEl);
    });
  }
  
  /**
   * Close the note modal
   */
  closeModal() {
    this.noteModal.style.display = 'none';
    this.activeNoteId = null;
  }
  
  /**
   * Save note from modal data
   */
  saveNoteFromModal() {
    // Get form values
    const title = document.getElementById('modalNoteTitle').value.trim();
    const content = document.getElementById('modalNoteContent').innerHTML;
    const pinned = document.getElementById('pinNote').checked;
    const color = this.getSelectedColor();
    
    // Get tags
    const tags = Array.from(document.getElementById('noteTagsList').children)
      .map(tagEl => tagEl.dataset.tag);
    
    // Validate (at least have content)
    if (!title && !content.trim()) {
      showToast('Заметка не может быть пустой', 'warning');
      return;
    }
    
    if (this.activeNoteId) {
      // Update existing note
      const note = this.storage.getNoteById(this.activeNoteId);
      
      if (note) {
        note.update({
          title,
          content,
          color,
          tags,
          pinned
        });
        
        this.storage.updateNote(note);
        showToast('Заметка обновлена', 'success');
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
      showToast('Заметка создана', 'success');
    }
    
    // Close modal
    this.closeModal();
    
    // Reload notes
    this.loadNotes();
  }
  
  /**
   * Delete note from modal
   */
  deleteNoteFromModal() {
    if (!this.activeNoteId) return;
    
    if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
      this.storage.deleteNote(this.activeNoteId);
      showToast('Заметка удалена', 'success');
      
      // Close modal
      this.closeModal();
      
      // Reload notes
      this.loadNotes();
    }
  }
  
  /**
   * Filter notes based on search input and tag filters
   */
  filterNotes() {
    const searchInput = document.getElementById('searchNotes');
    const searchText = searchInput.value.trim().toLowerCase();
    
    // Show/hide clear search button
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
      clearSearchBtn.style.display = searchText ? 'block' : 'none';
    }
    
    // Update search text
    this.searchText = searchText;
    
    // Get all notes
    const allNotes = this.storage.getNotes();
    
    // Apply filters
    const filteredNotes = allNotes.filter(note => {
      // Filter by search text
      const matchesSearch = !searchText || 
        note.title.toLowerCase().includes(searchText) || 
        note.getPlainTextContent().toLowerCase().includes(searchText);
      
      // Filter by tags
      const matchesTags = this.filterTags.length === 0 || 
        this.filterTags.every(tag => note.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
    
    // Sort and render filtered notes
    this.sortNotesByType(filteredNotes, this.sortType);
    this.renderNotes(filteredNotes);
  }
  
  /**
   * Clear search input
   */
  clearSearch() {
    const searchInput = document.getElementById('searchNotes');
    searchInput.value = '';
    this.searchText = '';
    this.filterNotes();
  }
  
  /**
   * Sort notes based on selected option
   */
  sortNotes() {
    const sortSelect = document.getElementById('sortNotes');
    this.sortType = sortSelect.value;
    
    // Save preference
    localStorage.setItem('sort-type', this.sortType);
    
    // Re-render notes with new sort
    this.filterNotes();
  }
  
  /**
   * Sort array of notes by selected type
   * @param {Array} notes - Array of notes to sort
   * @param {String} sortType - Sort type: 'updated', 'created', 'title'
   * @returns {Array} Sorted array
   */
  sortNotesByType(notes, sortType) {
    // Sort based on selected option
    switch (sortType) {
      case 'updated':
        notes.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        break;
      case 'created':
        notes.sort((a, b) => new Date(b.created) - new Date(a.created));
        break;
      case 'title':
        notes.sort((a, b) => {
          // Handle empty titles
          const titleA = a.title || 'Без названия';
          const titleB = b.title || 'Без названия';
          return titleA.localeCompare(titleB);
        });
        break;
    }
    
    return notes;
  }
  
  /**
   * Toggle note pin status
   * @param {Number} noteId - ID of the note to toggle pin
   */
  toggleNotePin(noteId) {
    const note = this.storage.getNoteById(noteId);
    
    if (note) {
      note.togglePin();
      this.storage.updateNote(note);
      this.loadNotes();
    }
  }
  
  /**
   * Change the view mode (grid or list)
   * @param {String} mode - 'grid' or 'list'
   */
  changeViewMode(mode) {
    this.viewMode = mode;
    
    // Update buttons
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    
    if (mode === 'grid') {
      this.notesContainer.className = 'notes-grid';
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    } else {
      this.notesContainer.className = 'notes-list';
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    }
    
    // Save preference
    localStorage.setItem('view-mode', mode);
    
    // Re-render notes
    this.loadNotes();
  }
  
  /**
   * Add a tag from the input field
   */
  addTagFromInput() {
    const tagInput = document.getElementById('noteTags');
    const tagText = tagInput.value.trim();
    
    if (tagText) {
      // Split by commas if multiple tags
      const tags = tagText.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Add each tag
      tags.forEach(tag => this.addTagToModal(tag));
      
      // Clear input
      tagInput.value = '';
    }
  }
  
  /**
   * Add a tag to the modal
   * @param {String} tag - Tag to add
   */
  addTagToModal(tag) {
    // Normalize tag
    tag = tag.trim().toLowerCase();
    
    if (!tag) return;
    
    // Check if tag already exists
    const existingTag = document.querySelector(`.note-tag-item[data-tag="${tag}"]`);
    if (existingTag) return;
    
    // Create tag element
    const tagsList = document.getElementById('noteTagsList');
    const tagEl = document.createElement('div');
    tagEl.className = 'note-tag-item';
    tagEl.dataset.tag = tag;
    
    tagEl.innerHTML = `
      <span>${tag}</span>
      <button type="button" class="remove-tag">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add event listener to remove button
    const removeBtn = tagEl.querySelector('.remove-tag');
    removeBtn.addEventListener('click', () => {
      tagEl.remove();
    });
    
    // Add to list
    tagsList.appendChild(tagEl);
  }
  
  /**
   * Render tags in the modal
   * @param {Array} tags - Tags to render
   */
  renderModalTags(tags) {
    const tagsList = document.getElementById('noteTagsList');
    tagsList.innerHTML = '';
    
    tags.forEach(tag => this.addTagToModal(tag));
  }
  
  /**
   * Get the currently selected color in the modal
   * @returns {String} Color name
   */
  getSelectedColor() {
    const selectedColor = document.querySelector('.color-option.selected');
    return selectedColor ? selectedColor.dataset.color : 'default';
  }
  
  /**
   * Select a note color in the modal
   * @param {String} color - Color to select
   */
  selectNoteColor(color) {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));
    
    const selectedOption = document.querySelector(`.color-option[data-color="${color}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
  }
  
  /**
   * Update the sidebar tags list
   */
  updateTagsList() {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;
    
    // Clear list
    tagsList.innerHTML = '';
    
    // Get all tags with counts
    const tagPairs = getSortedTags(this.storage.notes, 'count');
    
    // Add tags to list
    tagPairs.forEach(([tag, count]) => {
      const tagEl = createTagElement(tag, count, (tagName) => {
        this.toggleTagFilter(tagName);
      });
      
      // Add active class if tag is in filter
      if (this.filterTags.includes(tag)) {
        tagEl.classList.add('active');
      }
      
      tagsList.appendChild(tagEl);
    });
  }
  
  /**
   * Toggle a tag in the filter list
   * @param {String} tag - Tag to toggle
   */
  toggleTagFilter(tag) {
    const index = this.filterTags.indexOf(tag);
    
    if (index === -1) {
      // Add tag to filter
      this.filterTags.push(tag);
    } else {
      // Remove tag from filter
      this.filterTags.splice(index, 1);
    }
    
    // Update tag list in sidebar
    const tagItems = document.querySelectorAll('.tag-item');
    tagItems.forEach(item => {
      const itemTag = item.querySelector('.tag-name span').textContent;
      
      if (this.filterTags.includes(itemTag)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update active filters display
    this.renderActiveFilters();
    
    // Filter notes
    this.filterNotes();
  }
  
  /**
   * Render active filters
   */
  renderActiveFilters() {
    const filtersContainer = document.getElementById('activeFilters');
    if (!filtersContainer) return;
    
    // Clear container
    filtersContainer.innerHTML = '';
    
    // Add each filter tag
    this.filterTags.forEach(tag => {
      const filterEl = document.createElement('div');
      filterEl.className = 'filter-tag';
      
      filterEl.innerHTML = `
        <span>${tag}</span>
        <button class="remove-filter">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Add event listener to remove button
      const removeBtn = filterEl.querySelector('.remove-filter');
      removeBtn.addEventListener('click', () => {
        this.toggleTagFilter(tag);
      });
      
      filtersContainer.appendChild(filterEl);
    });
  }
  
  /**
   * Toggle sidebar visibility
   */
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
  }
  
  /**
   * Show a toast notification
   * @param {String} message - Message to display
   * @param {String} type - 'success', 'error', or 'warning'
   */
  showToast(message, type = 'success') {
    // This is implemented in export.js
    showToast(message, type);
  }
}