import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, push, set, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDqBaUqF_DT125ZKu5sqE7SmYsJ2qE8tHY",
  authDomain: "songtranslator-91f75.firebaseapp.com",
  databaseURL: "https://songtranslator-91f75-default-rtdb.firebaseio.com",
  projectId: "songtranslator-91f75",
  storageBucket: "songtranslator-91f75.firebasestorage.app",
  messagingSenderId: "317917056626",
  appId: "1:317917056626:web:a0203d77d2943665c6fceb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

// For now we use a simple demo user id since full auth isn't implemented yet
const DEFAULT_USER_ID = 'demo_user';

export const getVocabulary = async (userId = DEFAULT_USER_ID) => {
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

export const addToVocabulary = async (userId = DEFAULT_USER_ID, word) => {
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
        transliteration: word.transliteration || '',
        base: word.base || '',
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

export const removeFromVocabulary = async (userId = DEFAULT_USER_ID, wordId) => {
  try {
    await remove(ref(db, 'users/' + userId + '/vocab/' + wordId));
    return true;
  } catch (error) {
    console.error('Error removing from vocabulary:', error);
    return false;
  }
};




