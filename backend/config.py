import os
from dotenv import load_dotenv

# Load .env file if present (takes priority over system env vars)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

class Config:
    OPENAI_API_KEY    = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")