const VOCABULARY_STORAGE_KEY = 'arabic_songs_vocabulary';

export const getVocabulary = () => {
  try {
    const stored = localStorage.getItem(VOCABULARY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    return [];
  }
};

export const addToVocabulary = (word) => {
  try {
    const vocabulary = getVocabulary();
    // Check if word already exists
    const exists = vocabulary.some(
      (item) => item.english.toLowerCase() === word.english.toLowerCase() &&
                item.arabic === word.arabic
    );
    
    if (!exists) {
      vocabulary.push({ ...word, id: Date.now().toString() });
      localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(vocabulary));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to vocabulary:', error);
    return false;
  }
};

export const removeFromVocabulary = (id) => {
  try {
    const vocabulary = getVocabulary();
    const filtered = vocabulary.filter((item) => item.id !== id);
    localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from vocabulary:', error);
    return false;
  }
};

