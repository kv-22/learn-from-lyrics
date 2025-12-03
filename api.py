from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from main import translate, q_and_a

class Song(BaseModel):
    artist_name: str
    song_name: str

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
    translated_output = translate(song.artist_name, song.song_name)
    print(translated_output)
    return {
        "translated_output": translated_output
    }
    
    
    