import os
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app, ensure_db_ready

client = TestClient(app)


def setup_function() -> None:
    db_path = "/tmp/pm-backend-test.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    os.environ["PM_DB_PATH"] = db_path
    ensure_db_ready()


def test_health_json() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "pm-backend"}


def test_root_html() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "<!DOCTYPE html>" in response.text
    assert "<html" in response.text


def test_get_board() -> None:
    response = client.get("/api/board")
    assert response.status_code == 200
    data = response.json()
    assert len(data["columns"]) == 5
    assert isinstance(data["cards"], dict)


def test_update_board() -> None:
    board = client.get("/api/board").json()
    first_column = board["columns"][0]
    first_column["title"] = "Updated Backlog"
    response = client.put("/api/board", json=board)
    assert response.status_code == 200
    updated = response.json()
    assert updated["columns"][0]["title"] == "Updated Backlog"
    reloaded = client.get("/api/board").json()
    assert reloaded["columns"][0]["title"] == "Updated Backlog"


def test_ai_connection_requires_api_key() -> None:
    os.environ.pop("OPENROUTER_API_KEY", None)
    response = client.get("/api/ai/test")
    assert response.status_code == 400
    assert "OPENROUTER_API_KEY" in response.json()["detail"]


def test_ai_connection_success() -> None:
    os.environ["OPENROUTER_API_KEY"] = "dummy"

    class DummyResponse:
        status_code = 200

        @staticmethod
        def json() -> dict:
            return {"choices": [{"message": {"content": "4"}}]}

    with patch("app.main.httpx.post", return_value=DummyResponse()):
        response = client.get("/api/ai/test")
    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["question"] == "2+2"
    assert body["answer"] == "4"


def test_ai_plan_reply_only() -> None:
    os.environ["OPENROUTER_API_KEY"] = "dummy"
    raw = '{"reply":"Focus on Discovery this week.","board_update":null}'
    with patch("app.main.call_openrouter", return_value=raw):
        response = client.post(
            "/api/ai/plan",
            json={"question": "What should we do next?", "history": []},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Focus on Discovery this week."
    assert body["board_update"] is None


def test_ai_plan_with_board_update() -> None:
    os.environ["OPENROUTER_API_KEY"] = "dummy"
    board = client.get("/api/board").json()
    board["columns"][0]["title"] = "Top Priority"
    raw = '{"reply":"Updated backlog name.","board_update":' + str(board).replace("'", '"') + "}"
    with patch("app.main.call_openrouter", return_value=raw):
        response = client.post(
            "/api/ai/plan",
            json={"question": "Rename backlog", "history": []},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Updated backlog name."
    assert body["board_update"] is not None
    assert body["board_update"]["columns"][0]["title"] == "Top Priority"


def test_ai_plan_invalid_json_fallback() -> None:
    os.environ["OPENROUTER_API_KEY"] = "dummy"
    with patch("app.main.call_openrouter", return_value="not-json response"):
        response = client.post(
            "/api/ai/plan",
            json={"question": "Help", "history": []},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "not-json response"
    assert body["board_update"] is None
