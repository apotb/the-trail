import os

ENV = {}

def load(path=".env"):
    global ENV
    if not os.path.exists(path):
        ENV = {}
        return
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            ENV[key] = value

def get(value):
    global ENV
    return ENV.get(value, value)