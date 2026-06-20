import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import requests
from datetime import datetime
from scipy.stats import poisson
from supabase import create_client, Client

# Chargement automatique du .env
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_sports_key = os.getenv("API_SPORTS_KEY")

@app.get("/api/matches/today")
async def get_today_matches():
    date_du_jour = datetime.now().strftime("%Y-%m-%d")
    url = "https://v3.football.api-sports.io/fixtures"
    headers = {"x-apisports-key": api_sports_key}
    querystring = {"date": date_du_jour}
    try:
        response = requests.get(url, headers=headers, params=querystring)
        data = response.json()
        return data.get('response', [])
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/test-api")
def test_api_sports():
    return {"status": "OK", "cle_detectee": api_sports_key is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=10000)
