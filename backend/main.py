from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.pipeline import preprocess, postprocess
from backend.models import run_local, compare_models

app = FastAPI()

# Allow frontend (opened as a local file) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Request(BaseModel):
    text: str


@app.get("/")
def serve_frontend():
    return FileResponse("frontend/index.html")
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")


@app.post("/analyze")
def analyze(req: Request):
    cleaned = preprocess(req.text)
    raw = run_local(cleaned)
    raw["parsed"] = postprocess(raw["output"])
    return raw


@app.post("/compare")
def compare(req: Request):
    cleaned = preprocess(req.text)
    return compare_models(cleaned)  # BUG FIX: was missing `return`

