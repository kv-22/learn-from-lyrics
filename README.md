# Learn from Lyrics
This is a vibe-coded web app whose purpose is to aid language learning via music. You can search for a song, get a lyric-by-lyric translation, as well as a word-by-word translation. Currently, only Arabic-English is supported. Hence, the word-by-word translation offers additional information such as the transliteration, base form, and note, for better understanding. You can add words with their explanation to build and track your vocabulary. You can also ask questions about each word's explanation. Try it out!

## Prerequisites:
OPENAI_API_KEY

GENIUS_ACCESS_TOKEN (get it from [here](https://genius.com/signup))

## How to run:
```
git clone https://github.com/kv-22/learn-from-lyrics.git
cd learn-from-lyrics
export OPENAI_API_KEY="yourapikey"
export GENIUS_ACCESS_TOKEN="yourtoken"
docker compose up --build
```

The app will then be accessible at http://localhost:5173/

### Tech stack:
- FastAPI for backend
- Firebase for authentication and database
- React + Vite for frontend

### What did I learn?
- Some prompting techniques
- Some docker commands
- Some stuff about firebase, logging, and uv
- Vibe coding is not just vibes
- Copyright is annoying

### Remaining work:
- [ ] Change input handling 
- [ ] Reduce latency
- [ ] Deploy
- [ ] Add two more languages maybe




