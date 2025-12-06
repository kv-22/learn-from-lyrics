from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main import translate, q_and_a

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
        "http://localhost:3000",
        "",  # Your computer's IP on hotspot
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/get_translation")
async def get_translation(song: Song):
    translated_output = translate(artist_name=song.artist_name, song_name=song.song_name)
    print(translated_output)
    return {
        "translated_output": translated_output
    }
    
@app.post("/chat")
async def chat(request: ChatRequest):
    word = request.word
    context = "Word:" + word.arabic_text + "\nTranslation:" + word.english_translation + "\nTransliteration:" + word.transliteration + "\nBase:" + word.base + "\nNote:" + word.note
    print(context)
    previous_response_id = request.previous_response_id if request.previous_response_id else None
    response_id, response = q_and_a(query=request.query, context=context, translated_output=request.translated_output, previous_response_id=previous_response_id)
    print(response)
    return {
        "response_id": response_id,
        "response": response
    }

    
    