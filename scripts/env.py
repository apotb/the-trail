import os

ENV = {}

def load(path=".env"):
    global ENV
    if not os.path.exists(path):
        ENV = {}
        return
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            ENV[key] = value

def get(value):
    global ENV
    return ENV.get(value, value)