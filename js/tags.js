/**
 * Tags management functionality
 */

/**
 * Get all unique tags from notes
 * @param {Array} notes - Array of notes
 * @returns {Object} Object with tag names as keys and counts as values
 */
function getAllTags(notes) {
  const tagCounts = {};
  
  notes.forEach(note => {
    note.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return tagCounts;
}

/**
 * Get an array of the most used tags
 * @param {Object} tagCounts - Object with tag counts
 * @param {Number} limit - Maximum number of tags to return
 * @returns {Array} Array of tag names sorted by usage count
 */
function getTopTags(tagCounts, limit = 5) {
  return Object.keys(tagCounts)
    .sort((a, b) => tagCounts[b] - tagCounts[a])
    .slice(0, limit);
}

/**
 * Get suggested tags based on note content
 * @param {String} content - Note content (plain text)
 * @param {Array} existingTags - Array of existing tags
 * @returns {Array} Array of suggested tags
 */
function suggestTags(content, existingTags = []) {
  // List of common words to exclude (could be expanded)
  const excludeWords = ['the', 'and', 'is', 'in', 'to', 'a', 'for', 'of', 'with', 'на', 'в', 'и', 'с', 'по', 'для'];
  
  // Convert content to lowercase and remove punctuation
  const cleanContent = content.toLowerCase().replace(/[^\wа-яё\s]/gi, '');
  
  // Split into words
  const words = cleanContent.split(/\s+/);
  
  // Count word frequency
  const wordCounts = {};
  words.forEach(word => {
    // Ignore short words and common words
    if (word.length > 3 && !excludeWords.includes(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Sort by frequency and get top words
  const suggestedTags = Object.keys(wordCounts)
    .sort((a, b) => wordCounts[b] - wordCounts[a])
    .slice(0, 5);
  
  // Filter out existing tags
  return suggestedTags.filter(tag => !existingTags.includes(tag));
}

/**
 * Create tag element for sidebar
 * @param {String} tagName - Name of the tag
 * @param {Number} count - Number of notes with this tag
 * @param {Function} clickHandler - Function to call when tag is clicked
 * @returns {HTMLElement} Tag element
 */
function createTagElement(tagName, count, clickHandler) {
  const tagElement = document.createElement('div');
  tagElement.className = 'tag-item';
  tagElement.innerHTML = `
    <div class="tag-name">
      <i class="fas fa-tag"></i>
      <span>${tagName}</span>
    </div>
    <span class="tag-count">${count}</span>
  `;
  
  if (clickHandler) {
    tagElement.addEventListener('click', () => clickHandler(tagName));
  }
  
  return tagElement;
}

/**
 * Get and sort all tags from notes
 * @param {Array} notes - Array of notes
 * @param {String} sortType - How to sort tags ('alpha' or 'count')
 * @returns {Array} Sorted array of [tag, count] pairs
 */
function getSortedTags(notes, sortType = 'alpha') {
  const tagCounts = getAllTags(notes);
  const tagPairs = Object.entries(tagCounts);
  
  if (sortType === 'alpha') {
    return tagPairs.sort((a, b) => a[0].localeCompare(b[0]));
  } else {
    return tagPairs.sort((a, b) => b[1] - a[1]);
  }
}
