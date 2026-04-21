---
title: Financial News Analyzer
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Financial News Analyzer

A small full-stack project for analyzing the sentiment of financial news headlines using transformer-based NLP models.

The app takes a news headline or short financial text, sends it to a FastAPI backend, and returns a sentiment label such as **Positive**, **Negative**, or **Neutral** together with a short explanation and model latency. It also includes a simple model comparison view and a lightweight frontend built with plain HTML, CSS, and JavaScript.

I also deployed the project on **Hugging Face Spaces**.

## What this project does

- analyzes financial headlines and short news text
- uses **FinBERT** locally for financial sentiment classification
- compares predictions across more than one model
- shows sentiment, category, reasoning, and latency
- keeps a small in-browser history of previous analyses
- displays a simple sentiment breakdown chart on the frontend

## Why I built it

The goal of this project was to build a simple but complete AI web app around a real use case.
Instead of doing general sentiment analysis, this project focuses on **financial language**, where normal sentiment models often fail because market-related wording can be very domain-specific.

## Tech stack

**Backend**
- FastAPI
- Python
- Hugging Face Transformers
- Torch

**Frontend**
- HTML
- CSS
- Vanilla JavaScript

**Model(s)**
- `ProsusAI/finbert`
- `yiyanghkust/finbert-tone`

**Deployment**
- Docker
- Hugging Face Spaces

## How it works

1. The user enters a financial headline or short text.
2. The frontend sends the text to the FastAPI backend.
3. The backend preprocesses the input.
4. A FinBERT-based model predicts the sentiment.
5. The backend formats the result and sends it back.
6. The frontend shows the prediction, explanation, latency, and optional comparison results.

## Project structure

```bash
fixed-3/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── pipeline.py
│   └── evaluation.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── data/
│   └── sample_dataset.json
├── Dockerfile
├── Procfile
├── requirements.txt
├── runtime.txt
└── README.md
```

## Main features

### 1. Financial sentiment analysis
The backend uses **ProsusAI/finbert**, which is trained for financial text rather than general-purpose sentiment tasks.

### 2. Model comparison
The app can compare results from multiple financial sentiment models and show their outputs side by side.

### 3. Simple interactive frontend
The frontend is intentionally lightweight and does not rely on heavy frameworks. It includes:
- text input
- random sample news button
- analysis history
- sentiment breakdown bars
- comparison table

### 4. Hugging Face Spaces deployment
The project is structured so it can run inside a Docker-based Hugging Face Space.

## Example input

```text
Tesla reports surprise quarterly profit, stock surges.
```

## Example output

```text
Sentiment: Positive
Category: Financial
Reasoning: FinBERT classified this as Positive with high confidence.
```

## Environment variables

If you want to use Hugging Face API-based calls, set your token like this:

```bash
export HF_TOKEN="your_token_here"
```

## Notes

- the main local model is `ProsusAI/finbert`
- the frontend is served through FastAPI
- CORS is enabled to make local frontend/backend interaction easier
- the app is designed for short financial text and headlines, not long reports

