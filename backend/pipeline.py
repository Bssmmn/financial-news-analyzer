import re

def preprocess(text):
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def postprocess(raw_output):
    # assuming your model outputs text like:
    # Sentiment: Positive | Reasoning: ... | Tag: Economy

    sentiment = "Unknown"
    reasoning = ""
    tag = ""

    if "positive" in raw_output.lower():
        sentiment = "Positive"
    elif "negative" in raw_output.lower():
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    reasoning = raw_output
    tag = "General"

    return {
        "sentiment": sentiment,
        "reasoning": reasoning,
        "tag": tag
    }