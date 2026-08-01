from langchain_groq import ChatGroq
from dotenv import load_dotenv
from config import MODEL_NAME, MODEL_TEMPERATURE

load_dotenv()

def get_llm():
    return ChatGroq(model=MODEL_NAME, temperature=MODEL_TEMPERATURE)
