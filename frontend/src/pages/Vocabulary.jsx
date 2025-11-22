import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getVocabulary, removeFromVocabulary } from '../utils/vocabulary';
import './Vocabulary.css';

const Vocabulary = ({ onMenuClick }) => {
  const [vocabulary, setVocabulary] = useState([]);

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = () => {
    const vocab = getVocabulary();
    setVocabulary(vocab);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this word from your vocabulary?')) {
      removeFromVocabulary(id);
      loadVocabulary();
    }
  };

  const wordCount = vocabulary.length;

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
        </div>

        {vocabulary.length === 0 ? (
          <div className="empty-vocabulary">
            <p>No words saved yet. Select text from a song translation and add it to your vocabulary!</p>
          </div>
        ) : (
          <div className="vocabulary-list">
            {vocabulary.map((item) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vocabulary;

