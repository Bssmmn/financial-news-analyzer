# BUG FIX: use relative import so this works when run as part of the package
from backend.models import compare_models


def evaluate(texts):
    results = []
    for text in texts:
        res = compare_models(text)
        results.append(res)
    return results
