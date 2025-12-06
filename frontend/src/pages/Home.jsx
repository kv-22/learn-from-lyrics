import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { addToVocabulary } from '../utils/vocabulary';
import { auth } from '../utils/firebase';
import ChatPanel from '../components/ChatPanel';
import './Home.css';

// Format song/artist names for display:
// - Trim whitespace
// - If the text starts with an English letter, title-case each English word
const formatDisplayName = (name) => {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  const firstChar = trimmed[0];
  if (/[A-Za-z]/.test(firstChar)) {
    return trimmed
      .split(' ')
      .map((word) => {
        if (!word) return '';
        const ch = word[0];
        if (/[A-Za-z]/.test(ch)) {
          return ch.toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  }

  return trimmed;
};

const Home = ({ onMenuClick }) => {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore last search/translation from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('song_translator_home_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.songName) setSongName(parsed.songName);
        if (parsed.artistName) setArtistName(parsed.artistName);
        if (parsed.translation) setTranslation(parsed.translation);
      }
    } catch (error) {
      console.error('Error restoring Home state from localStorage', error);
    }
  }, []);

  const parseWordTranslation = (wordTranslationText) => {
    // Parse word-by-word translation entries
    // Format can be either:
    // 1. Word: "..." Translation: ... Transliteration: ... Base: ... Note: ... (without asterisks)
    // 2. *Word:* "..." *Translation:* ... *Transliteration:* ... *Base:* ... *Note:* ... (with asterisks)
    const words = [];
    
    if (!wordTranslationText || !wordTranslationText.trim()) {
      return words;
    }
    
    // Remove header if present
    let text = wordTranslationText.trim();
    if (text.includes('##')) {
      const headerEnd = text.indexOf('\n\n');
      if (headerEnd > 0) {
        text = text.substring(headerEnd + 2).trim();
      }
    }
    
    // Try to find all word entries by looking for "Word:" pattern
    // Handle both with and without asterisks
    const wordEntryRegex = /(?:^|\n+)(?:\*)?Word(?:\*)?:\s*"([^"]+)"([\s\S]*?)(?=(?:\n\n|\n)(?:\*)?Word(?:\*)?:|$)/g;
    
    let match;
    while ((match = wordEntryRegex.exec(text)) !== null) {
      const word = match[1].trim();
      const restOfEntry = match[2].trim();
      
      // Extract Translation (handle both formats)
      const translationMatch = restOfEntry.match(/(?:\*)?Translation(?:\*)?:\s*([^\n]+)/);
      
      // Extract Transliteration
      const transliterationMatch = restOfEntry.match(/(?:\*)?Transliteration(?:\*)?:\s*([^\n]+)/);
      
      // Extract Base
      const baseMatch = restOfEntry.match(/(?:\*)?Base(?:\*)?:\s*([^\n]+)/);
      
      // Extract Note (everything after Note: until end or next word)
      const noteMatch = restOfEntry.match(/(?:\*)?Note(?:\*)?:\s*([\s\S]+)/);
      
      // Use values as provided by the backend (no additional filtering here)
      const note = noteMatch ? noteMatch[1].trim() : '';
      const translation = translationMatch ? translationMatch[1].trim() : '';
      const transliteration = transliterationMatch ? transliterationMatch[1].trim() : '';
      const base = baseMatch ? baseMatch[1].trim() : '';
      
      words.push({
        word,
        translation,
        transliteration,
        base,
        note,
      });
    }
    
    // If regex didn't work, try splitting by double newlines and parsing each block
    if (words.length === 0) {
      const blocks = text.split(/\n\n+/).filter(b => b.trim());
      blocks.forEach(block => {
        // Check if this block starts with Word:
        if (block.match(/^(?:\*)?Word(?:\*)?:/)) {
          const wordMatch = block.match(/(?:\*)?Word(?:\*)?:\s*"([^"]+)"/);
          if (wordMatch) {
            const word = wordMatch[1].trim();
            const translationMatch = block.match(/(?:\*)?Translation(?:\*)?:\s*([^\n]+)/);
            const transliterationMatch = block.match(/(?:\*)?Transliteration(?:\*)?:\s*([^\n]+)/);
            const baseMatch = block.match(/(?:\*)?Base(?:\*)?:\s*([^\n]+)/);
            const noteMatch = block.match(/(?:\*)?Note(?:\*)?:\s*([\s\S]+)/);
            
            // Use values as provided by the backend (no additional filtering here)
            const note = noteMatch ? noteMatch[1].trim() : '';
            const translation = translationMatch ? translationMatch[1].trim() : '';
            const transliteration = transliterationMatch ? transliterationMatch[1].trim() : '';
            const base = baseMatch ? baseMatch[1].trim() : '';
            
            words.push({
              word,
              translation,
              transliteration,
              base,
              note,
            });
          }
        }
      });
    }
    
    console.log('Parsed', words.length, 'words from translation');
    if (words.length === 0) {
      console.log('Sample of text being parsed:', text.substring(0, 500));
    }
    
    return words;
  };

  const parseTranslation = (translatedOutput) => {
    // Parse the backend response which contains dialect, ltranslation, and wtranslation
    try {
      let dialect = '';
      let lineTranslation = '';
      let lineTranslationHeader = '';
      let wordTranslation = '';
      let parsedWords = [];

      // Extract dialect
      if (translatedOutput.includes('<dialect>') && translatedOutput.includes('</dialect>')) {
        const dialectMatch = translatedOutput.match(/<dialect>([\s\S]*?)<\/dialect>/);
        if (dialectMatch) {
          dialect = dialectMatch[1].trim().replace('## Dialect:', '').trim();
        }
      }

      // Extract line translation
      if (translatedOutput.includes('<ltranslation>') && translatedOutput.includes('</ltranslation>')) {
        const ltransMatch = translatedOutput.match(/<ltranslation>([\s\S]*?)<\/ltranslation>/);
          if (ltransMatch) {
            let rawLineTranslation = ltransMatch[1].trim();
          
          // Extract header if present
          if (rawLineTranslation.includes('## Line-by-line translation and transliteration:')) {
            const headerMatch = rawLineTranslation.match(/## Line-by-line translation and transliteration:[\s\n]*/);
            if (headerMatch) {
              lineTranslationHeader = 'Line-by-line translation and transliteration';
              rawLineTranslation = rawLineTranslation.replace(/## Line-by-line translation and transliteration:[\s\n]*/, '').trim();
            }
            }
            
            // Use line translation as provided by the backend (no additional filtering here)
            lineTranslation = rawLineTranslation.trim();
        }
      }

      // Extract word translation
      if (translatedOutput.includes('<wtranslation>') && translatedOutput.includes('</wtranslation>')) {
        const wtransMatch = translatedOutput.match(/<wtranslation>([\s\S]*?)<\/wtranslation>/);
        if (wtransMatch) {
          // Use word translation as provided by the backend (no additional filtering here)
          wordTranslation = wtransMatch[1].trim();
          parsedWords = parseWordTranslation(wordTranslation);
          console.log('Parsed words:', parsedWords.length, 'from word translation text');
        }
      }

      return { dialect, lineTranslation, lineTranslationHeader, wordTranslation, parsedWords };
    } catch (error) {
      console.error('Error parsing translation:', error);
      return { dialect: '', lineTranslation: translatedOutput, lineTranslationHeader: '', wordTranslation: '', parsedWords: [] };
    }
  };

  const handleSearch = async () => {
    // Validate required fields
    if (!songName.trim()) {
      alert('Please enter a song name');
      return;
    }

    if (!artistName.trim()) {
      alert('Please enter an artist name');
      return;
    }

    setLoading(true);
    
    try {
      // Call the FastAPI backend
      // Use window.location.hostname to dynamically get the current host
      const apiHost = window.location.hostname;
      const response = await fetch(`http://${apiHost}:8000/get_translation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist_name: artistName.trim(),
          song_name: songName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract translated_output - it should be a string with the translation
      // containing dialect, ltranslation, and wtranslation sections
      const translatedOutput = data.translated_output;
      
      // Parse the translation sections from the string
      const { dialect, lineTranslation, lineTranslationHeader, wordTranslation, parsedWords } = parseTranslation(
        translatedOutput || ''
      );
      
      const newTranslation = {
        song: formatDisplayName(songName),
        artist: formatDisplayName(artistName),
        dialect: dialect || 'Unknown',
        lineTranslation: lineTranslation || translatedOutput || '',
        lineTranslationHeader: lineTranslationHeader || '',
        wordTranslation: wordTranslation || '',
        parsedWords: parsedWords || [],
        translatedOutput: translatedOutput || '', // Store the full translated output for chat
      };

      setTranslation(newTranslation);

      // Persist state so navigating away and back keeps the content
      try {
        localStorage.setItem(
          'song_translator_home_state',
          JSON.stringify({
            songName: songName.trim(),
            artistName: artistName.trim(),
            translation: newTranslation,
          })
        );
      } catch (error) {
        console.error('Error saving Home state to localStorage', error);
      }
    } catch (error) {
      console.error('Error fetching translation:', error);
      const apiHost = window.location.hostname;
      alert(`Error fetching translation: ${error.message}. Make sure the FastAPI server is running on http://${apiHost}:8000`);
    } finally {
      setLoading(false);
    }
  };

  // Selection-based add-to-vocabulary has been removed.

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
            <input
              type="text"
              className="search-input"
              placeholder="Search for a song..."
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
          </div>

          <button className="search-button" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {!translation && !loading && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <h2>Search for Arabic Songs</h2>
            <p>Type the name of a song in the search bar to see its lyrics with translations.</p>
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
            <div className="song-card">
              <div className="song-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
              <div className="song-info">
                <div className="song-name">{translation.song}</div>
                <div className="song-artist">{translation.artist}</div>
              </div>
            </div>

            <div className="translation-content">
              <h3 className="translation-section-title">Dialect: {translation.dialect}</h3>
              
              {translation.lineTranslationHeader && (
                <h3 className="translation-section-title">{translation.lineTranslationHeader}</h3>
              )}
              
              <div className="translation-text" id="translation-text">
                {translation.lineTranslation.split('\n\n').map((paragraph, idx) => {
                  // Parse each paragraph to extract English-Arabic pairs
                  const lines = paragraph.split('\n').filter(l => l.trim());
                  if (lines.length >= 3) {
                    // Format: Arabic, Transliteration, English
                    const arabic = lines[0].replace(/"/g, '');
                    const transliteration = lines[1];
                    const english = lines[2];
                    
                    return (
                      <div key={idx} className="phrase-card">
                        <div className="phrase-english">{english}</div>
                        <div className="phrase-right">
                          <div className="phrase-arabic" dir="rtl">{arabic}</div>
                          {transliteration && (
                            <div className="phrase-transliteration">{transliteration}</div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="translation-paragraph">
                      {lines.map((line, lineIdx) => (
                        <div key={lineIdx} className="translation-line">{line}</div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="word-translations">
                <h3 className="translation-section-title">Word-by-word Translation</h3>
                <div className="translation-text">
                  {translation.parsedWords && translation.parsedWords.length > 0 ? (
                    translation.parsedWords.map((word, idx) => (
                      <WordBlock key={idx} word={word} translatedOutput={translation.translatedOutput} />
                    ))
                  ) : (
                    translation.wordTranslation.split('\n\n').map((wordBlock, idx) => (
                      <div key={idx} className="word-block">
                        {wordBlock.split('\n').map((line, lineIdx) => (
                          <div key={lineIdx} className="translation-line">{line}</div>
                        ))}
                      </div>
                    ))
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
      const added = await addToVocabulary(null, {
        arabic: word.word,
        english: word.translation,
        translation: word.translation,
        transliteration: word.transliteration || '',
        base: word.base || '',
        note: word.note || '',
      });

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
      if (error.message === 'User not authenticated') {
        setStatus({
          type: 'error',
          message: 'Please sign in to add words to your vocabulary.',
        });
      } else {
        setStatus({
          type: 'error',
          message: 'There was an error adding this word to your vocabulary.',
        });
      }
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
            <span className="word-arabic" dir="rtl">{word.word}</span>
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

