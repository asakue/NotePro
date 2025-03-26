/**
 * Note class - Represents a note in the application
 */
class Note {
  /**
   * Create a new note
   * @param {Object} data - The note data
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.title = data.title || '';
    this.content = data.content || '';
    this.created = data.created || new Date().toISOString();
    this.updated = data.updated || new Date().toISOString();
    this.color = data.color || 'default';
    this.tags = data.tags || [];
    this.pinned = data.pinned || false;
  }
  
  /**
   * Update the note with new data
   * @param {Object} data - The updated note data
   */
  update(data) {
    if (data.title !== undefined) {
      this.title = data.title;
    }
    
    if (data.content !== undefined) {
      this.content = data.content;
    }
    
    if (data.color !== undefined) {
      this.color = data.color;
    }
    
    if (data.tags !== undefined) {
      this.tags = data.tags;
    }
    
    if (data.pinned !== undefined) {
      this.pinned = data.pinned;
    }
    
    // Always update the 'updated' timestamp
    this.updated = new Date().toISOString();
  }
  
  /**
   * Get formatted date for display
   * @param {string} dateType - 'created' or 'updated'
   * @returns {string} Formatted date string
   */
  getFormattedDate(dateType = 'updated') {
    const dateString = dateType === 'created' ? this.created : this.updated;
    return formatDate(dateString);
  }
  
  /**
   * Get plain text content (strip HTML tags)
   * @returns {string} Plain text content
   */
  getPlainTextContent() {
    return extractTextFromHtml(this.content);
  }
  
  /**
   * Add a tag to the note
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    // Normalize the tag
    tag = tag.trim().toLowerCase();
    
    // Skip empty tags
    if (!tag) return;
    
    // Don't add duplicate tags
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updated = new Date().toISOString();
    }
  }
  
  /**
   * Remove a tag from the note
   * @param {string} tag - Tag to remove
   */
  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
      this.updated = new Date().toISOString();
    }
  }
  
  /**
   * Toggle pin status
   */
  togglePin() {
    this.pinned = !this.pinned;
    this.updated = new Date().toISOString();
  }
  
  /**
   * Convert note to JSON object for storage
   * @returns {Object} JSON representation of the note
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      created: this.created,
      updated: this.updated,
      color: this.color,
      tags: this.tags,
      pinned: this.pinned
    };
  }
}