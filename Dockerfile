# Dockerfile pour Hugging Face Spaces
# HF impose le port 7860 et un utilisateur non-root

FROM python:3.12-slim

WORKDIR /app

# Copier et installer les dépendances
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code backend
COPY backend/app ./app

# Créer un utilisateur non-root (requis par Hugging Face)
RUN useradd -m -u 1000 appuser
USER appuser

# HuggingFace Spaces impose le port 7860
EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
