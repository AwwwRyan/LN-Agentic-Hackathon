from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.rfq_router import router as rfq_router
from routers.lsp_router import router as lsp_router
from db.database import init_db
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(title="SitBack Autonomous Negotiation Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rfq_router)
app.include_router(lsp_router)

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup."""
    await init_db()
    logging.info("Negotiation JSON storage initialized (data/storage/).")

@app.get("/")
async def root():
    return {"message": "SitBack Autonomous Negotiation Agent API is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
