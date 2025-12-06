import { db, auth } from "./firebase"
import { ref, get, push, set, remove } from "firebase/database";

// Get current user ID from Firebase auth
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

export const getVocabulary = async (userId = null) => {
  if (!userId) {
    userId = getCurrentUserId();
  }
  try {
    const snapshot = await get(ref(db, 'users/' + userId + '/vocab'));
    if (snapshot.exists()) {
      const vocabData = snapshot.val();
      // Convert object to array with ids
      return Object.entries(vocabData).map(([id, data]) => ({
        ...data, // Copy all data and then add id
        id
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    return [];
  }
};

export const addToVocabulary = async (userId = null, word) => {
  if (!userId) {
    userId = getCurrentUserId();
  }
  try {
    // Check if word already exists
    const vocabulary = await getVocabulary(userId);
    const exists = vocabulary.some(
      (item) =>
        item.english.toLowerCase() === word.english.toLowerCase() &&
        item.arabic === word.arabic
    );

    if (!exists) {
      const newWordRef = push(ref(db, 'users/' + userId + '/vocab'));
      await set(newWordRef, {
        arabic: word.arabic,
        english: word.english,
        translation: word.translation,
        transliteration: word.transliteration,
        base: word.base,
        note: word.note || ''
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to vocabulary:', error);
    return false;
  }
};

export const removeFromVocabulary = async (userId = null, wordId) => {
  if (!userId) {
    userId = getCurrentUserId();
  }
  try {
    await remove(ref(db, 'users/' + userId + '/vocab/' + wordId));
    return true;
  } catch (error) {
    console.error('Error removing from vocabulary:', error);
    return false;
  }
};




