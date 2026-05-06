# Backend

FastAPI app in `backend/`. Packaged and run via Docker (see repo root `Dockerfile` and `docker-compose.yml`).

**概要（日本語）:** `backend/` にある FastAPI アプリです。リポジトリ直下の Docker でビルド・起動します。

## Layout

- `app/main.py` — FastAPI app, routes
- `static/index.html` — placeholder page for Part 2 (`/` serves this file)
- `tests/` — pytest tests
- `pyproject.toml` / `uv.lock` — dependencies (managed with `uv`)

**構成（日本語）:**

- `app/main.py` … アプリ本体とルート定義
- `static/index.html` … パート2用の仮ページ（`/` で配信）
- `tests/` … pytest
- `pyproject.toml` / `uv.lock` … 依存関係（`uv` で管理）

## Routes (Part 2)

- `GET /` — static hello page
- `GET /api/health` — JSON `{"status":"ok","service":"pm-backend"}`

**ルート（日本語）:** `/` は Hello ページ、`/api/health` は動作確認用の JSON。

## Local dev (optional)

From `backend/`:

```bash
uv sync --all-groups
uv run pytest
uv run uvicorn app.main:app --reload --port 8000
```

**ローカル開発（日本語）:** `backend/` で上記のように `uv` で依存を入れ、テストや `uvicorn` で起動できます（Docker 以外の選択肢）。
