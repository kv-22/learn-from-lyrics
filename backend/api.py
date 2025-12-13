from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main import translate, q_and_a
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO, 
    format="{asctime} - {name} - {levelname} - {message}",
    style="{",
    handlers=[
        logging.FileHandler("./logs/app.log",  mode="a", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

logging.getLogger('httpx').setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

class Song(BaseModel):
    artist_name: str
    song_name: str

class Word(BaseModel):
    arabic_text: str
    english_translation: str
    transliteration: str
    base: str
    note: str

class ChatRequest(BaseModel):
    word: Word
    query: str
    translated_output: str
    previous_response_id: str | None = None # = for default value

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "",  # Your computer's IP on hotspot
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/get_translation")
async def get_translation(song: Song):
    try:
        translation = translate(artist_name=song.artist_name, song_name=song.song_name)
        return translation
    except Exception:
        logger.exception("Error in translation endpoint.")
        raise HTTPException(status_code=500, detail="Server error. Please try again.")
        
        
    
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        word = request.word
        context = "Word:" + word.arabic_text + "\nTranslation:" + word.english_translation + "\nTransliteration:" + word.transliteration + "\nBase:" + word.base + "\nNote:" + word.note
        previous_response_id = request.previous_response_id if request.previous_response_id else None
        answer = q_and_a(query=request.query, context=context, translated_output=request.translated_output, previous_response_id=previous_response_id)
        return answer
    except Exception:
        logger.exception('Error in chat endpoint.')
        raise HTTPException(status_code=500, detail="Server error. Please try again.")
        
        

    
    