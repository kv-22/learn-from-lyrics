import lyricsgenius
import os
from dotenv import load_dotenv

load_dotenv()

GENIUS_ACCESS_TOKEN = os.environ.get("GENIUS_ACCESS_TOKEN")

def deduplicate_verses(lyrics: str) -> str:
    """
    Remove repeated verses from lyrics while preserving order.
    Splits lyrics into verses (by blank lines) and keeps only first occurrence of each.
    """
    if not lyrics:
        return lyrics
    
    # Split into verses (separated by blank lines)
    verses = lyrics.split('\n\n')
    
    # Track seen verses and maintain order
    seen = set()
    unique_verses = []
    
    for verse in verses:
        # Normalize whitespace for comparison
        normalized = verse.strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            unique_verses.append(verse)
    
    return '\n\n'.join(unique_verses)

def get_lyrics(artist_name: str, song_name: str):
    genius = lyricsgenius.Genius(GENIUS_ACCESS_TOKEN)

    song = genius.search_song(song_name, artist_name)
    return song.lyrics

def get_lyrics_deduplicated(artist_name: str, song_name: str):
    """Get lyrics with repeated verses removed."""
    lyrics = get_lyrics(artist_name, song_name).lower()
    return deduplicate_verses(lyrics)
    