# Dockerfile for ai-model-api (Flask)
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure models and logs directories exist
RUN mkdir -p models logs

ENV AI_MODEL_PORT=5001
EXPOSE 5001

CMD ["python", "app.py"]
