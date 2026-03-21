from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.routes import router
from app.database import bootstrap

BASE_DIR = Path(__file__).parent

# ── Bootstrap DB on startup ──
bootstrap()

app = FastAPI(
    title="PBI Docs API",
    description="Biblioteca de documentación de reportes Power BI — NADRO",
    version="2.0.0",
)

# ── API routes ──
app.include_router(router, prefix="/api")

# ── Static files ──
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
app.mount("/pdfs", StaticFiles(directory=BASE_DIR / "pdfs"), name="pdfs")

# ── SPA routing ──
@app.get("/", include_in_schema=False)
async def root():
    return FileResponse(BASE_DIR / "static" / "index.html")

@app.get("/{full_path:path}", include_in_schema=False)
async def spa_fallback(full_path: str):
    return FileResponse(BASE_DIR / "static" / "index.html")
