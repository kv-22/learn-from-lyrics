import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { addToVocabulary } from '../utils/vocabulary';
import { auth } from '../utils/firebase';
import ChatPanel from '../components/ChatPanel';
import './Home.css';

// Format song/artist names for display:
// - Trim whitespace
// - If the text starts with an English letter, title-case each English word
// const formatDisplayName = (name) => {
//   if (!name) return '';
//   const trimmed = name.trim();
//   if (!trimmed) return '';

//   const firstChar = trimmed[0];
//   if (/[A-Za-z]/.test(firstChar)) {
//     return trimmed
//       .split(' ')
//       .map((word) => {
//         if (!word) return '';
//         const ch = word[0];
//         if (/[A-Za-z]/.test(ch)) {
//           return ch.toUpperCase() + word.slice(1);
//         }
//         return word;
//       })
//       .join(' ');
//   }

//   return trimmed;
// };

const Home = ({ translation, setTranslation, songLyrics, setLyrics, onMenuClick }) => {

  // const [songName, setSongName] = useState('');
  // const [artistName, setArtistName] = useState('');
  // const [songLyrics, setLyrics] = useState('');
  // const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restore last search/translation from localStorage on mount
  // useEffect(() => {
  //   try {
  //     const savedState = localStorage.getItem('song_translator_home_state');
  //     if (savedState) {
  //       const parsed = JSON.parse(savedState);
  //       if (parsed.songName) setSongName(parsed.songName);
  //       if (parsed.artistName) setArtistName(parsed.artistName);
  //       if (parsed.translation) setTranslation(parsed.translation);
  //     }
  //   } catch (error) {
  //     console.error('Error restoring Home state from localStorage', error);
  //   }
  // }, []);

  

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSearch = async () => {
    // Validate required fields
    // if (!songName.trim()) {
    //   setError('Please enter a song name');
    //   return;
    // }

    // if (!artistName.trim()) {
    //   setError('Please enter an artist name');
    //   return;
    // }

    if (!songLyrics.trim()) {
      setError('Please enter the lyrics.');
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous error

    try {
      // Call the FastAPI backend
      // Use window.location.hostname to dynamically get the current host
      const response = await fetch(`${backendUrl}/get_translation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // artist_name: artistName.trim(),
          // song_name: songName.trim(),
          song_lyrics: songLyrics.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response contains an error
      if (data.error) {
        setError(data.error);
        setTranslation(null); // Clear any previous translation
        setLoading(false);
        return;
      }
      
      const newTranslation = {
        // song: formatDisplayName(songName),
        // artist: formatDisplayName(artistName),
        dialect: data.dialect || 'Unknown',
        lineTranslations: data.ltranslation || [],
        wordTranslations: data.wtranslation || [], 
        rawOutput: data.raw_output || '', 
      };
      
      setTranslation(newTranslation);

    } catch (error) {
      console.error('Error fetching translation:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="home-page">
      <Header title="Home" onMenuClick={onMenuClick} />
      
      <div className="home-content">
        <div className="search-section">
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <textarea
              className="search-input"
              value={songLyrics}
              onChange={(e) => setLyrics(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <button className="search-button" onClick={handleSearch} disabled={loading}>
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>

        {!translation && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <h2>Translate Arabic Songs</h2>
            <p>Paste the lyrics of a song to see its translation.</p>
          </div>
        )}

        {error && !loading && (
          <div className="empty-state">
            <h3>{error}</h3>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Translating song...</p>
          </div>
        )}

        {translation && (
          <div className="translation-section">

            <div className="translation-content">
              <h3 className="translation-section-title">Dialect: {translation.dialect}</h3>
              
              <h3 className="translation-section-title">Line-by-line Translation</h3>
              
              <div className="translation-text" id="translation-text">
                {translation.lineTranslations && translation.lineTranslations.length > 0 ? (
                  translation.lineTranslations.map((line, idx) => (
                    <div key={idx} className="phrase-card">
                      <div className="phrase-english">{line.translation}</div>
                      <div className="phrase-right">
                        <div className="phrase-arabic" dir="rtl">{line.arabic}</div>
                        <div className="phrase-transliteration">{line.transliteration}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No line translations available</p>
                )}
              </div>

              <div className="word-translations">
                <h3 className="translation-section-title">Word-by-word Translation</h3>
                <div className="translation-text">
                  {translation.wordTranslations && translation.wordTranslations.length > 0 ? (
                    translation.wordTranslations.map((word, idx) => (
                      <WordBlock 
                        key={idx} 
                        word={{
                          arabic: word.arabic,
                          translation: word.translation,
                          transliteration: word.transliteration,
                          base: word.base,
                          note: word.note
                        }}
                        translatedOutput={translation.rawOutput}
                      />
                    ))
                  ) : (
                    <p>No word translations available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WordBlock = ({ word, translatedOutput }) => {
  const [status, setStatus] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleAdd = async () => {
    // Clear any previous status
    setStatus(null);

    if (!auth.currentUser) {
      setStatus({
        type: 'error',
        message: 'Please sign in to add words to your vocabulary.',
      });
      return;
    }

    try {
      const added = await addToVocabulary(null, word);

      if (added) {
        setStatus({
          type: 'success',
          message: 'Added to vocabulary!',
        });
      } else {
        setStatus({
          type: 'info',
          message: 'This word is already in your vocabulary',
        });
      }
    } catch (error) {
      console.error('Error adding word to vocabulary', error);
    }
  };

  return (
    <>
      <div className="word-block">
        <div className="word-header">
          <div className="word-header-buttons">
            <button
              className="word-chat-button"
              onClick={() => setIsChatOpen(true)}
              aria-label="Chat about this word"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button
              className="word-add-button"
              onClick={handleAdd}
              aria-label="Add word to vocabulary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <div className="word-header-main">
            <span className="word-arabic" dir="rtl">{word.arabic}</span>
            {word.transliteration && (
              <span className="word-transliteration">{word.transliteration}</span>
            )}
          </div>
        </div>
      {status && (
        <div className={`word-status word-status-${status.type}`}>
          {status.message}
        </div>
      )}
      <div className="word-translation">{word.translation}</div>
      {word.base && (
        <div className="word-base">Base: {word.base}</div>
      )}
      {word.note && (
        <div className="word-note">{word.note}</div>
      )}
      </div>
      <ChatPanel
        word={word}
        translatedOutput={translatedOutput}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default Home;

