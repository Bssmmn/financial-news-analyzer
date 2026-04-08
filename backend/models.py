import os
import time
import requests
from transformers import pipeline

# ─── CONFIG ───────────────────────────────────────────────────────
# Set your HuggingFace token: export HF_TOKEN="hf_..."
HF_TOKEN = os.environ.get("HF_TOKEN", "")

# ─── LOCAL MODEL ──────────────────────────────────────────────────
# FIX: switched from distilgpt2 (autocomplete, useless for sentiment)
# to a real financial sentiment classifier trained on financial news
LOCAL_MODEL_NAME = "ProsusAI/finbert"

print(f"Loading local model: {LOCAL_MODEL_NAME} ...")
sentiment_pipeline = pipeline(
    "text-classification",
    model=LOCAL_MODEL_NAME,
    tokenizer=LOCAL_MODEL_NAME,
)
print("Model loaded.")


def run_local(text):
    start = time.time()
    result = sentiment_pipeline(text[:512])[0]  # finbert max 512 tokens
    latency = time.time() - start

    label = result["label"].capitalize()   # positive / negative / neutral
    score = round(result["score"], 3)

    return {
        "model": LOCAL_MODEL_NAME,
        "output": f"{label} (confidence: {score})",
        "parsed": {
            "sentiment": label,
            "category":  "Financial",
            "reasoning": f"FinBERT classified this as {label} with {score*100:.1f}% confidence."
        },
        "latency": round(latency, 3)
    }


# ─── HF API MODEL ─────────────────────────────────────────────────
def build_prompt(text):
    return f"""You are a strict financial AI.

Return ONLY this format:
REASONING: one sentence
SENTIMENT: Positive or Negative or Neutral
CATEGORY: one word

News: {text}
Answer:"""


def parse_output(text):
    result = {"reasoning": "", "sentiment": "", "category": ""}
    for line in text.split("\n"):
        if "REASONING" in line:
            result["reasoning"] = line.split(":", 1)[-1].strip()
        elif "SENTIMENT" in line:
            result["sentiment"] = line.split(":", 1)[-1].strip()
        elif "CATEGORY" in line:
            result["category"] = line.split(":", 1)[-1].strip()
    return result


def run_api(model_id, text):
    API_URL = f"https://router.huggingface.co/hf-inference/models/{model_id}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": build_prompt(text), "parameters": {"max_new_tokens": 150}}

    start = time.time()
    response = requests.post(API_URL, headers=headers, json=payload)
    latency = time.time() - start

    try:
        data = response.json()
        output = data[0]["generated_text"]
    except Exception as e:
        return {
            "model": model_id,
            "error": f"API error: {response.text[:200]}",
            "latency": round(latency, 3)
        }

    return {
        "model": model_id,
        "raw": output,
        "parsed": parse_output(output),
        "latency": round(latency, 3)
    }


# ─── COMPARISON ───────────────────────────────────────────────────
def compare_models(text):
    results = {}

    # Local FinBERT - always works
    results["finbert-local"] = run_local(text)

    # Second model: also runs locally, no token needed
    # "yiyanghkust/finbert-tone" is another financial sentiment model
    try:
        from transformers import pipeline as hf_pipeline
        pipe2 = hf_pipeline(
            "text-classification",
            model="yiyanghkust/finbert-tone"
        )
        start = __import__("time").time()
        r = pipe2(text[:512])[0]
        latency = round(__import__("time").time() - start, 3)
        label = r["label"].capitalize()
        score = round(r["score"], 3)
        results["finbert-tone"] = {
            "model": "yiyanghkust/finbert-tone",
            "parsed": {
                "sentiment": label,
                "category": "Financial",
                "reasoning": f"FinBERT-Tone classified this as {label} with {score*100:.1f}% confidence."
            },
            "latency": latency
        }
    except Exception as e:
        results["finbert-tone"] = {"error": str(e)}

    return results