# Étape 1 : image de base Python légère
FROM python:3.12-slim

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copier les dépendances en premier (optimisation cache Docker)
# Si requirements.txt ne change pas, Docker réutilise ce layer sans réinstaller
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY app/ ./app/

# Port exposé par le serveur
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
