/**
 * Note statistics functionality
 */

/**
 * Update note statistics in the UI
 * @param {String} text - Plain text content of the note
 */
function updateNoteStats(text) {
  const wordCount = countWords(text);
  const charCount = countCharacters(text);
  const readTime = getReadingTime(text);
  
  document.getElementById('wordCount').textContent = `${wordCount} ${pluralize(wordCount, 'слово', 'слова', 'слов')}`;
  document.getElementById('charCount').textContent = `${charCount} ${pluralize(charCount, 'символ', 'символа', 'символов')}`;
  
  const readingTimeEl = document.getElementById('readingTime');
  if (readingTimeEl) {
    if (readTime.minutes === 0 && readTime.seconds < 30) {
      readingTimeEl.textContent = 'Меньше минуты чтения';
    } else if (readTime.minutes === 0) {
      readingTimeEl.textContent = 'Около минуты чтения';
    } else {
      readingTimeEl.textContent = `${readTime.minutes} ${pluralize(readTime.minutes, 'минута', 'минуты', 'минут')} чтения`;
    }
  }
}

/**
 * Count words in text
 * @param {String} text - Text to count words in
 * @returns {Number} Number of words
 */
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // Split by whitespace and filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Count characters in text
 * @param {String} text - Text to count characters in
 * @returns {Number} Number of characters
 */
function countCharacters(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.length;
}

/**
 * Helper for Russian pluralization
 * @param {Number} count - The number to check
 * @param {String} form1 - Form for 1 (e.g., слово)
 * @param {String} form2 - Form for 2-4 (e.g., слова)
 * @param {String} form5 - Form for 5+ (e.g., слов)
 * @returns {String} The correct form
 */
function pluralize(count, form1, form2, form5) {
  let remainder10 = count % 10;
  let remainder100 = count % 100;
  
  if (remainder10 === 1 && remainder100 !== 11) {
    return form1;
  } else if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 12 || remainder100 > 14)) {
    return form2;
  } else {
    return form5;
  }
}

/**
 * Get reading time estimate
 * @param {String} text - Text to estimate reading time for
 * @param {Number} wordsPerMinute - Average reading speed in words per minute
 * @returns {Object} Object with minutes and seconds
 */
function getReadingTime(text, wordsPerMinute = 200) {
  const words = countWords(text);
  const minutes = Math.floor(words / wordsPerMinute);
  const seconds = Math.round((words % wordsPerMinute) / (wordsPerMinute / 60));
  
  return { minutes, seconds };
}
