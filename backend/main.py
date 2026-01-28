from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import Base, engine
from api.v1.api import api_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Yarn Trading Platform API",
    description="Backend API for yarn trading with WhatsApp automation",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Yarn Trading Platform API", "version": "1.0.0"}
