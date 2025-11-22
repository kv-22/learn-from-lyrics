import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { addToVocabulary } from '../utils/vocabulary';
import './Home.css';

const Home = ({ onMenuClick }) => {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAddButton, setShowAddButton] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedTextContent = selection.toString().trim();
      
      if (selectedTextContent.length > 0 && translation) {
        // Get the selected element to find the phrase card
        try {
          const range = selection.getRangeAt(0);
          let container = range.commonAncestorContainer;
          
          // If container is a text node, get its parent
          if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement;
          }
          
          // Find the closest phrase card
          const phraseCard = container.closest ? container.closest('.phrase-card') : null;
          
          if (phraseCard) {
            // Extract English and Arabic from the phrase card
            const englishEl = phraseCard.querySelector('.phrase-english');
            const arabicEl = phraseCard.querySelector('.phrase-arabic');
            const transliterationEl = phraseCard.querySelector('.phrase-transliteration');
            
            const english = englishEl?.textContent?.trim() || selectedTextContent;
            const arabic = arabicEl?.textContent?.trim() || '';
            const transliteration = transliterationEl?.textContent?.trim() || '';
            
            setSelectedText(selectedTextContent);
            setSelectedWord({ english, arabic, transliteration });
            setShowAddButton(true);
          } else {
            // Fallback to simple word lookup
            const word = findWordInTranslation(selectedTextContent);
            setSelectedText(selectedTextContent);
            setSelectedWord(word);
            setShowAddButton(true);
          }
        } catch (error) {
          // Fallback to simple word lookup
          const word = findWordInTranslation(selectedTextContent);
          setSelectedText(selectedTextContent);
          setSelectedWord(word);
          setShowAddButton(true);
        }
      } else {
        setShowAddButton(false);
        setSelectedText('');
        setSelectedWord(null);
      }
    };

    const handleClick = (e) => {
      // Close selection if clicking outside
      if (!e.target.closest('.translation-text') && !e.target.closest('.add-vocab-button-container')) {
        setShowAddButton(false);
        setSelectedText('');
        setSelectedWord(null);
        window.getSelection().removeAllRanges();
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClick);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [translation]);

  const findWordInTranslation = (text) => {
    // Dummy implementation - in production, parse the translation to find matching words
    // For now, we'll create a simple word object
    const words = [
      { english: 'Hello', arabic: 'مرحبا', transliteration: 'Marhaba' },
      { english: 'How are you', arabic: 'كيف حالك', transliteration: 'Kayfa Haluk' },
      { english: 'I am fine', arabic: 'أنا بخير', transliteration: 'Ana Bekhair' },
      { english: 'Thank you very much', arabic: 'شكرا جزيلا', transliteration: 'Shukran Jazilan' },
    ];

    // Try exact match first
    const exactMatch = words.find(
      (w) => w.english.toLowerCase() === text.toLowerCase().trim()
    );

    if (exactMatch) return exactMatch;

    // Try partial match
    const partialMatch = words.find(
      (w) => w.english.toLowerCase().includes(text.toLowerCase().trim()) ||
             text.toLowerCase().trim().includes(w.english.toLowerCase())
    );

    if (partialMatch) return partialMatch;

    // If no match, try to extract from the selection context
    // For now, return a basic word object
    return { english: text.trim(), arabic: '', transliteration: '' };
  };

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
      
      // Filter out "---" from note, translation, transliteration, and base
      const cleanNote = noteMatch ? noteMatch[1].replace(/---+/g, '').trim() : '';
      const cleanTranslation = translationMatch ? translationMatch[1].replace(/---+/g, '').trim() : '';
      const cleanTransliteration = transliterationMatch ? transliterationMatch[1].replace(/---+/g, '').trim() : '';
      const cleanBase = baseMatch ? baseMatch[1].replace(/---+/g, '').trim() : '';
      
      words.push({
        word: word,
        translation: cleanTranslation,
        transliteration: cleanTransliteration,
        base: cleanBase,
        note: cleanNote,
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
            
            // Filter out "---" from note, translation, transliteration, and base
            const cleanNote = noteMatch ? noteMatch[1].replace(/---+/g, '').trim() : '';
            const cleanTranslation = translationMatch ? translationMatch[1].replace(/---+/g, '').trim() : '';
            const cleanTransliteration = transliterationMatch ? transliterationMatch[1].replace(/---+/g, '').trim() : '';
            const cleanBase = baseMatch ? baseMatch[1].replace(/---+/g, '').trim() : '';
            
            words.push({
              word: word,
              translation: cleanTranslation,
              transliteration: cleanTransliteration,
              base: cleanBase,
              note: cleanNote,
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
          
          // Filter out "---" from line translation
          lineTranslation = rawLineTranslation.replace(/---+/g, '').trim();
        }
      }

      // Extract word translation
      if (translatedOutput.includes('<wtranslation>') && translatedOutput.includes('</wtranslation>')) {
        const wtransMatch = translatedOutput.match(/<wtranslation>([\s\S]*?)<\/wtranslation>/);
        if (wtransMatch) {
          // Filter out "---" from word translation
          wordTranslation = wtransMatch[1].replace(/---+/g, '').trim();
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
      const response = await fetch('http://localhost:8000/get_translation', {
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
      
      setTranslation({
        song: songName.trim(),
        artist: artistName.trim(),
        dialect: dialect || 'Unknown',
        lineTranslation: lineTranslation || translatedOutput || '',
        lineTranslationHeader: lineTranslationHeader || '',
        wordTranslation: wordTranslation || '',
        parsedWords: parsedWords || [],
      });
    } catch (error) {
      console.error('Error fetching translation:', error);
      alert(`Error fetching translation: ${error.message}. Make sure the FastAPI server is running on http://localhost:8000`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToVocabulary = () => {
    if (selectedWord) {
      const added = addToVocabulary({
        english: selectedWord.english,
        arabic: selectedWord.arabic || selectedText,
        transliteration: selectedWord.transliteration || '',
      });
      
      if (added) {
        alert(`Added "${selectedWord.english}" to vocabulary!`);
        setShowAddButton(false);
        setSelectedText('');
        setSelectedWord(null);
        window.getSelection().removeAllRanges();
      } else {
        alert('This word is already in your vocabulary');
      }
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

              {showAddButton && selectedWord && (
                <>
                  <div className="highlighted-phrase-card">
                    <div className="highlighted-phrase-left">{selectedWord.english}</div>
                    <div className="highlighted-phrase-right" dir="rtl">
                      {selectedWord.arabic || selectedText}
                    </div>
                  </div>
                  <div className="add-vocab-button-container">
                    <button className="add-vocab-button" onClick={handleAddToVocabulary}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Add to Vocabulary
                    </button>
                  </div>
                </>
              )}

              <div className="word-translations">
                <h3 className="translation-section-title">Word-by-word Translation</h3>
                <div className="translation-text">
                  {translation.parsedWords && translation.parsedWords.length > 0 ? (
                    translation.parsedWords.map((word, idx) => (
                      <div key={idx} className="word-block">
                        <div className="word-header">
                          <span className="word-arabic" dir="rtl">{word.word}</span>
                          <span className="word-transliteration">{word.transliteration}</span>
                        </div>
                        <div className="word-translation">{word.translation}</div>
                        {word.base && (
                          <div className="word-base">Base: {word.base}</div>
                        )}
                        {word.note && (
                          <div className="word-note">{word.note}</div>
                        )}
                      </div>
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

export default Home;

