import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getVocabulary, removeFromVocabulary } from '../utils/vocabulary';
import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './Vocabulary.css';

const Vocabulary = ({ onMenuClick }) => {
  const [vocabulary, setVocabulary] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const loadVocabulary = async () => {
    if (!auth.currentUser) return;
    try {
      const vocab = await getVocabulary();
      setVocabulary(vocab);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      setVocabulary([]);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadVocabulary();
      } else {
        setVocabulary([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      await removeFromVocabulary(null, pendingDeleteId);
      await loadVocabulary();
      setPendingDeleteId(null);
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  const wordCount = vocabulary.length;

  const filteredVocabulary = vocabulary.filter((item) => {
    if (!searchTerm.trim()) return true;
    const transliteration = (item.transliteration || '').toLowerCase();
    return transliteration.includes(searchTerm.toLowerCase().trim());
  });

  if (!user) {
    return (
      <div className="vocabulary-page">
        <Header title="My Vocabulary" onMenuClick={onMenuClick} />
        <div className="vocabulary-content">
          <div className="empty-vocabulary">
            <p>Please sign in to view your vocabulary.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vocabulary-page">
      <Header title="My Vocabulary" onMenuClick={onMenuClick} />
      
      <div className="vocabulary-content">
        <div className="vocabulary-header">
          <div className="vocabulary-title-section">
            <svg className="vocabulary-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <div>
              <h2 className="vocabulary-title">My Vocabulary</h2>
              <p className="vocabulary-count">
                {wordCount} {wordCount === 1 ? 'word' : 'words'} saved
              </p>
            </div>
          </div>
          {vocabulary.length > 0 && (
            <div className="vocabulary-search-container">
              <div className="vocabulary-search-input-wrapper">
                <svg
                  className="vocabulary-search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="16.5" y1="16.5" x2="21" y2="21"></line>
                </svg>
                <input
                  type="text"
                  className="vocabulary-search-input"
                  placeholder="Search by transliteration"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm.trim() && (
                <button
                  type="button"
                  className="vocabulary-search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {vocabulary.length === 0 ? (
          <div className="empty-vocabulary">
            <p>No words saved yet. Use the plus button next to a word in the translation to save it to your vocabulary.</p>
          </div>
        ) : (
          <div className="vocabulary-list">
            {filteredVocabulary.length === 0 ? (
              <div className="empty-vocabulary">
                <p>No words match your search.</p>
              </div>
            ) : (
              filteredVocabulary.map((item) => (
                <div key={item.id} className="vocabulary-item">
                  <div className="vocabulary-item-content">
                    <div className="vocabulary-word">
                      <span className="vocabulary-english">{item.english}</span>
                      {item.arabic && item.arabic.trim() && (
                        <span className="vocabulary-arabic">{item.arabic}</span>
                      )}
                      {item.transliteration && item.transliteration.trim() && (
                        <span className="vocabulary-transliteration">({item.transliteration})</span>
                      )}
                    </div>
                    {item.base && item.base.trim() && (
                      <div className="vocabulary-base">
                        <span className="vocabulary-base-label">Base:</span>{' '}
                        <span className="vocabulary-base-text">{item.base}</span>
                      </div>
                    )}
                    {item.note && item.note.trim() && (
                      <div className="vocabulary-note">
                        {item.note}
                      </div>
                    )}
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete word"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {pendingDeleteId && (
        <div className="vocabulary-confirm-overlay">
          <div className="vocabulary-confirm-modal">
            <h3 className="vocabulary-confirm-title">Remove word?</h3>
            <p className="vocabulary-confirm-text">
              Are you sure you want to remove this word from your vocabulary?
            </p>
            <div className="vocabulary-confirm-actions">
              <button
                type="button"
                className="vocabulary-confirm-button secondary"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="vocabulary-confirm-button danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vocabulary;

