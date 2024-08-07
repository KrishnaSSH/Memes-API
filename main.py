from fastapi import FastAPI
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import praw
import random
import requests
from dotenv import load_dotenv
import os
from io import BytesIO

# Load environment variables from .env file
load_dotenv()

# Get environment variables
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT')

# Initialize FastAPI
app = FastAPI()

# Initialize PRAW
reddit = praw.Reddit(
    client_id=REDDIT_CLIENT_ID,
    client_secret=REDDIT_CLIENT_SECRET,
    user_agent=REDDIT_USER_AGENT
)

# Set up Jinja2 templates
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/give")
async def give_meme():
    # Get the top memes from the memes subreddit
    memes_subreddit = reddit.subreddit('memes')
    top_memes = list(memes_subreddit.hot(limit=50))
    
    # Filter out non-memes (e.g., stickied posts or posts without image URLs)
    memes = [meme for meme in top_memes if not meme.stickied and hasattr(meme, 'url') and meme.url.endswith(('jpg', 'jpeg', 'png'))]

    if not memes:
        return {"error": "No memes found"}

    # Select a random meme
    random_meme = random.choice(memes)
    image_url = random_meme.url

    # Fetch the image
    response = requests.get(image_url)
    image_data = BytesIO(response.content)

    # Return the image as a streaming response
    return StreamingResponse(image_data, media_type="image/jpeg")
