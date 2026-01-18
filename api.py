from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import requests
import snowflake.connector
import sseclient
import os
from fastapi.middleware.cors import CORSMiddleware

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

class SuggestionRequest(BaseModel):
    transcript: str

@app.post("/suggest")
async def get_suggestions(request: SuggestionRequest):
    transcript = request.transcript.lower()
    print(f"Received transcript: {transcript}")
    
    # Much broader triggers for better detection
    triggers = [
        "remember", "forgot", "what is", "what's", "that thing", 
        "looking for", "describe", "describing", "how do you say", 
        "it's a", "it is a", "um", "uh", "what was it", "name of",
        "word for", "called", "place for", "give me a",
    ]
    
    # Trigger if a keyword is found OR if the transcript is long enough to be a description
    if any(trigger in transcript for trigger in triggers) or len(transcript) > 40:
        try:
            prompt = (
                f"The user is describing something they can't remember. "
                f"Context: '{transcript}'. "
                f"Provide 3 single-word suggestions for what they might be thinking of. "
                f"Return ONLY the words separated by commas. No other text."
            )
            
            response = model.generate_content(prompt)
            content = response.text.strip()
            
            print(f"Gemini Content: {content}")
            suggestions = [word.strip() for word in content.split(',')]
            
            return {
                "suggestions": suggestions[:3],
                "context_detected": True
            }
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            # Fallback to mock suggestions for demonstration
            mock_suggestions = ["Apple", "Apricot", "Avocado"] if "fruit" in transcript else ["Screwdriver", "Hammer", "Wrench"]
            return {
                "suggestions": mock_suggestions,
                "context_detected": True,
                "is_fallback": True
            }
    
    return {
        "suggestions": [],
        "context_detected": False
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
