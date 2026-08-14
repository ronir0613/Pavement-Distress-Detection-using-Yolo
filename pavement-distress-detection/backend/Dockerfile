FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure necessary directories exist
RUN mkdir -p uploads predictions models

# DigitalOcean App Platform typically provides the PORT environment variable
ENV PORT=8080
EXPOSE 8080

CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT}"
