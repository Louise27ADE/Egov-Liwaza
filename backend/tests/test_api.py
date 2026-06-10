"""
Tests d'intégration — vérifie que l'API FastAPI répond correctement.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthEndpoints:
    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "mcp" in data
        assert data["version"] == "1.0.0"
