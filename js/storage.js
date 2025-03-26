/**
 * Storage class - Manages note storage operations
 */
class NotesStorage {
  constructor() {
    this.storageKey = 'notepro-notes';
    this.notes = this.getNotes();
  }
  
  /**
   * Get all notes from storage
   * @returns {Array} Array of notes
   */
  getNotes() {
    // Get notes from local storage
    const notesJson = localStorage.getItem(this.storageKey);
    let notes = [];
    
    // If notes exist in storage, parse them
    if (notesJson) {
      try {
        const parsedNotes = JSON.parse(notesJson);
        
        // Convert plain objects to Note instances
        notes = parsedNotes.map(noteData => new Note(noteData));
      } catch (error) {
        console.error('Error parsing notes from storage:', error);
        
        // In case of error, return empty array
        return [];
      }
    }
    
    return notes;
  }
  
  /**
   * Save notes to storage
   * @param {Array} notes - Array of notes to save
   */
  saveNotes(notes) {
    try {
      // Convert notes to plain objects
      const notesData = notes.map(note => note.toJSON());
      
      // Save to local storage
      localStorage.setItem(this.storageKey, JSON.stringify(notesData));
      
      // Update the instance property
      this.notes = notes;
      
      return true;
    } catch (error) {
      console.error('Error saving notes to storage:', error);
      return false;
    }
  }
  
  /**
   * Add a new note
   * @param {Note} note - Note to add
   * @returns {Boolean} Success status
   */
  addNote(note) {
    // Ensure it's a Note instance
    if (!(note instanceof Note)) {
      note = new Note(note);
    }
    
    // Add the note to the array
    this.notes.push(note);
    
    // Save to storage
    return this.saveNotes(this.notes);
  }
  
  /**
   * Update an existing note
   * @param {Note} updatedNote - Note with updated data
   * @returns {Boolean} Success status
   */
  updateNote(updatedNote) {
    // Find the note index
    const index = this.notes.findIndex(note => note.id === updatedNote.id);
    
    // If note doesn't exist, return false
    if (index === -1) return false;
    
    // Update the note
    this.notes[index] = updatedNote;
    
    // Save to storage
    return this.saveNotes(this.notes);
  }
  
  /**
   * Delete a note
   * @param {Number} noteId - ID of the note to delete
   * @returns {Boolean} Success status
   */
  deleteNote(noteId) {
    // Filter out the note with the given ID
    const filteredNotes = this.notes.filter(note => note.id !== noteId);
    
    // If no notes were removed, return false
    if (filteredNotes.length === this.notes.length) return false;
    
    // Save the filtered notes
    return this.saveNotes(filteredNotes);
  }
  
  /**
   * Get a single note by ID
   * @param {Number} noteId - ID of the note to retrieve
   * @returns {Note|null} The note or null if not found
   */
  getNoteById(noteId) {
    return this.notes.find(note => note.id === noteId) || null;
  }
  
  /**
   * Clear all notes from storage
   * @returns {Boolean} Success status
   */
  clearAllNotes() {
    // Clear notes array
    this.notes = [];
    
    // Save empty array to storage
    return this.saveNotes(this.notes);
  }
  
  /**
   * Import notes from JSON data
   * @param {String} jsonData - JSON string containing notes data
   * @returns {Object} Result with status and message
   */
  importNotes(jsonData) {
    try {
      // Parse the JSON data
      const importedData = JSON.parse(jsonData);
      
      // Check if it's an array
      if (!Array.isArray(importedData)) {
        return { success: false, message: 'Неверный формат данных' };
      }
      
      // Validate notes
      const validNotes = importedData.filter(note => 
        note && note.title !== undefined && note.content !== undefined
      );
      
      if (validNotes.length === 0) {
        return { success: false, message: 'Нет действительных заметок для импорта' };
      }
      
      // Convert to Note instances and add IDs if missing
      const notes = validNotes.map(noteData => {
        if (!noteData.id) {
          noteData.id = generateId();
        }
        
        return new Note(noteData);
      });
      
      // Replace current notes
      this.notes = notes;
      
      // Save to storage
      const success = this.saveNotes(notes);
      
      if (success) {
        return { 
          success: true, 
          message: `Импортировано ${notes.length} заметок` 
        };
      } else {
        return { 
          success: false, 
          message: 'Ошибка при сохранении импортированных заметок' 
        };
      }
    } catch (error) {
      console.error('Error importing notes:', error);
      return { success: false, message: 'Ошибка при импорте: неверный формат JSON' };
    }
  }
  
  /**
   * Export notes as JSON string
   * @returns {String} JSON string of all notes
   */
  exportNotes() {
    // Convert notes to plain objects
    const notesData = this.notes.map(note => note.toJSON());
    
    // Convert to JSON
    return JSON.stringify(notesData, null, 2);
  }
}