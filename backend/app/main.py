import os
import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"

app = FastAPI()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "pm-backend"}


class CardModel(BaseModel):
    id: str
    title: str
    details: str = ""


class ColumnModel(BaseModel):
    id: str
    title: str
    cardIds: list[str] = Field(default_factory=list)


class BoardModel(BaseModel):
    columns: list[ColumnModel]
    cards: dict[str, CardModel]


class AITestResponse(BaseModel):
    ok: bool
    model: str
    question: str
    answer: str


class AIHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AIPlanRequest(BaseModel):
    question: str
    history: list[AIHistoryMessage] = Field(default_factory=list)
    username: str = "user"
    model: str | None = None


class AIPlanResponse(BaseModel):
    reply: str
    board_update: BoardModel | None = None


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def get_db_path() -> Path:
    path = os.getenv("PM_DB_PATH")
    if path:
        return Path(path)
    return DATA_DIR / "app.db"


def connect_db() -> sqlite3.Connection:
    db_path = get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS boards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          name TEXT NOT NULL DEFAULT 'My Board',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS columns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          board_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          board_id INTEGER NOT NULL,
          column_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          details TEXT NOT NULL DEFAULT '',
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
          FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_columns_board_position ON columns(board_id, position);
        CREATE INDEX IF NOT EXISTS idx_cards_column_position ON cards(column_id, position);
        CREATE INDEX IF NOT EXISTS idx_cards_board ON cards(board_id);
        """
    )
    conn.commit()


def seed_default_data(conn: sqlite3.Connection) -> None:
    existing_user = conn.execute(
        "SELECT id FROM users WHERE username = ?", ("user",)
    ).fetchone()
    if existing_user:
        return

    created_at = now_iso()
    cursor = conn.execute(
        "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
        ("user", "mvp_dummy_hash", created_at),
    )
    user_id = int(cursor.lastrowid)
    cursor = conn.execute(
        "INSERT INTO boards (user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
        (user_id, "My Board", created_at, created_at),
    )
    board_id = int(cursor.lastrowid)

    column_titles = ["Backlog", "Discovery", "In Progress", "Review", "Done"]
    column_ids: list[int] = []
    for index, title in enumerate(column_titles):
        cursor = conn.execute(
            """
            INSERT INTO columns (board_id, title, position, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (board_id, title, index, created_at, created_at),
        )
        column_ids.append(int(cursor.lastrowid))

    starter_cards = [
        (column_ids[0], 0, "Align roadmap themes", "Draft quarterly themes."),
        (column_ids[0], 1, "Gather customer signals", "Review support and sales notes."),
        (column_ids[1], 0, "Prototype analytics view", "Sketch dashboard layout."),
    ]
    for column_id, position, title, details in starter_cards:
        conn.execute(
            """
            INSERT INTO cards (board_id, column_id, title, details, position, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (board_id, column_id, title, details, position, created_at, created_at),
        )
    conn.commit()


def ensure_db_ready() -> None:
    with connect_db() as conn:
        ensure_schema(conn)
        seed_default_data(conn)


def get_board_by_username(username: str) -> BoardModel:
    with connect_db() as conn:
        user_row = conn.execute(
            "SELECT id FROM users WHERE username = ?", (username,)
        ).fetchone()
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")
        board_row = conn.execute(
            "SELECT id FROM boards WHERE user_id = ?", (user_row["id"],)
        ).fetchone()
        if not board_row:
            raise HTTPException(status_code=404, detail="Board not found")
        board_id = int(board_row["id"])

        columns_rows = conn.execute(
            "SELECT id, title FROM columns WHERE board_id = ? ORDER BY position ASC",
            (board_id,),
        ).fetchall()
        card_rows = conn.execute(
            """
            SELECT id, column_id, title, details
            FROM cards
            WHERE board_id = ?
            ORDER BY position ASC
            """,
            (board_id,),
        ).fetchall()

    cards: dict[str, CardModel] = {}
    cards_by_column: dict[int, list[str]] = {}
    for row in card_rows:
        card_id = f"card-{row['id']}"
        cards[card_id] = CardModel(
            id=card_id, title=row["title"], details=row["details"] or ""
        )
        cards_by_column.setdefault(int(row["column_id"]), []).append(card_id)

    columns = [
        ColumnModel(
            id=f"col-{row['id']}",
            title=row["title"],
            cardIds=cards_by_column.get(int(row["id"]), []),
        )
        for row in columns_rows
    ]
    return BoardModel(columns=columns, cards=cards)


def replace_board_for_username(username: str, payload: BoardModel) -> BoardModel:
    with connect_db() as conn:
        user_row = conn.execute(
            "SELECT id FROM users WHERE username = ?", (username,)
        ).fetchone()
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")
        board_row = conn.execute(
            "SELECT id FROM boards WHERE user_id = ?", (user_row["id"],)
        ).fetchone()
        if not board_row:
            raise HTTPException(status_code=404, detail="Board not found")
        board_id = int(board_row["id"])

        now = now_iso()
        conn.execute("DELETE FROM cards WHERE board_id = ?", (board_id,))
        conn.execute("DELETE FROM columns WHERE board_id = ?", (board_id,))

        for column_position, column in enumerate(payload.columns):
            column_cursor = conn.execute(
                """
                INSERT INTO columns (board_id, title, position, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (board_id, column.title, column_position, now, now),
            )
            new_column_id = int(column_cursor.lastrowid)
            for card_position, card_id in enumerate(column.cardIds):
                card = payload.cards.get(card_id)
                if not card:
                    continue
                conn.execute(
                    """
                    INSERT INTO cards (board_id, column_id, title, details, position, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        board_id,
                        new_column_id,
                        card.title,
                        card.details,
                        card_position,
                        now,
                        now,
                    ),
                )
        conn.execute(
            "UPDATE boards SET updated_at = ? WHERE id = ?",
            (now, board_id),
        )
        conn.commit()

    return get_board_by_username(username)


def get_openrouter_model() -> str:
    return os.getenv("OPENROUTER_MODEL", "openrouter/free")


def call_openrouter(question: str, model: str) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="OPENROUTER_API_KEY is not set. Please set it in your environment.",
        )

    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [{"role": "user", "content": question}],
            "temperature": 0,
        },
        timeout=30.0,
    )
    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"OpenRouter request failed: {response.status_code} {response.text}",
        )

    payload = response.json()
    try:
        content = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail="OpenRouter response format was unexpected.",
        ) from exc

    if not isinstance(content, str):
        return str(content)
    return content


def extract_json_object(text: str) -> dict | None:
    text = text.strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    snippet = text[start : end + 1]
    try:
        parsed = json.loads(snippet)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        return None
    return None


def build_planner_prompt(
    board: BoardModel, question: str, history: list[AIHistoryMessage]
) -> str:
    history_lines = "\n".join([f"- {item.role}: {item.content}" for item in history]) or "- (none)"
    return (
        "You are a Kanban planning assistant.\n"
        "Return ONLY JSON with this exact shape:\n"
        '{\n'
        '  "reply": "string",\n'
        '  "board_update": null OR {\n'
        '    "columns": [{"id":"col-...","title":"...","cardIds":["card-..."]}],\n'
        '    "cards": {"card-...":{"id":"card-...","title":"...","details":"..."}}\n'
        "  }\n"
        "}\n"
        "If no board change is needed, set board_update to null.\n"
        f"Current board JSON:\n{board.model_dump_json()}\n"
        f"Conversation history:\n{history_lines}\n"
        f"User question:\n{question}\n"
    )


def plan_with_ai(
    board: BoardModel,
    question: str,
    history: list[AIHistoryMessage],
    model: str,
) -> AIPlanResponse:
    prompt = build_planner_prompt(board=board, question=question, history=history)
    raw_output = call_openrouter(question=prompt, model=model)
    parsed = extract_json_object(raw_output)
    if not parsed:
        return AIPlanResponse(reply=raw_output, board_update=None)

    reply_value = parsed.get("reply")
    reply = reply_value if isinstance(reply_value, str) and reply_value.strip() else raw_output
    board_update_value = parsed.get("board_update")
    if board_update_value is None:
        return AIPlanResponse(reply=reply, board_update=None)
    try:
        board_update = BoardModel.model_validate(board_update_value)
    except Exception:
        board_update = None
    return AIPlanResponse(reply=reply, board_update=board_update)


@app.on_event("startup")
def startup() -> None:
    ensure_db_ready()


@app.get("/api/board", response_model=BoardModel)
def get_board(username: str = "user") -> BoardModel:
    ensure_db_ready()
    return get_board_by_username(username)


@app.put("/api/board", response_model=BoardModel)
def update_board(payload: BoardModel, username: str = "user") -> BoardModel:
    ensure_db_ready()
    return replace_board_for_username(username, payload)


@app.get("/api/ai/test", response_model=AITestResponse)
def test_ai_connection(question: str = "2+2", model: str | None = None) -> AITestResponse:
    selected_model = model or get_openrouter_model()
    answer = call_openrouter(question, selected_model)
    return AITestResponse(
        ok=True,
        model=selected_model,
        question=question,
        answer=answer,
    )


@app.post("/api/ai/plan", response_model=AIPlanResponse)
def ai_plan(payload: AIPlanRequest) -> AIPlanResponse:
    ensure_db_ready()
    board = get_board_by_username(payload.username)
    selected_model = payload.model or get_openrouter_model()
    return plan_with_ai(
        board=board,
        question=payload.question,
        history=payload.history,
        model=selected_model,
    )


app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
