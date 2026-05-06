# Database Model Proposal (Part 5)

This document proposes how to store Kanban data in SQLite for this MVP.

## 1) What this is for (plain language)

- We need a place to save the board so data does not disappear after refresh.
- We use SQLite because it is simple and works well for local Docker MVP.
- Even though MVP has one demo login (`user`), the structure should support more users later.

## 2) Design goals

- Keep it simple.
- One user has one board in MVP.
- Keep card order and column order.
- Make future API work (read/update board) straightforward.

## 3) Tables (simple explanation)

### `users`
Who is using the app.

- `id` (integer, primary key)
- `username` (text, unique, not null)
- `password_hash` (text, not null)
- `created_at` (text timestamp, not null)

Notes:
- For MVP, we seed one user: `user`.
- Password in DB should be stored as hash, not plain text.

### `boards`
Board metadata (one board per user in MVP).

- `id` (integer, primary key)
- `user_id` (integer, unique, not null, foreign key -> users.id)
- `name` (text, not null, default "My Board")
- `created_at` (text timestamp, not null)
- `updated_at` (text timestamp, not null)

Notes:
- `user_id` unique means each user has one board.

### `columns`
Columns inside a board.

- `id` (integer, primary key)
- `board_id` (integer, not null, foreign key -> boards.id)
- `title` (text, not null)
- `position` (integer, not null)
- `created_at` (text timestamp, not null)
- `updated_at` (text timestamp, not null)

Notes:
- `position` keeps left-to-right order.

### `cards`
Cards in each column.

- `id` (integer, primary key)
- `board_id` (integer, not null, foreign key -> boards.id)
- `column_id` (integer, not null, foreign key -> columns.id)
- `title` (text, not null)
- `details` (text, not null, default "")
- `position` (integer, not null)
- `created_at` (text timestamp, not null)
- `updated_at` (text timestamp, not null)

Notes:
- `position` keeps top-to-bottom order in a column.
- Moving a card between columns updates `column_id` and `position`.

## 4) Why not store whole board as one JSON blob?

We considered saving one big JSON in one table.

Pros:
- Very simple initial write.

Cons:
- Harder to update one card efficiently.
- Harder to query and test.
- Harder to enforce data consistency.

Decision:
- Use normalized tables (`users`, `boards`, `columns`, `cards`).
- API can still return/accept JSON format for frontend.

## 5) Example SQL schema (proposal)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'My Board',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE columns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE cards (
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

CREATE INDEX idx_columns_board_position ON columns(board_id, position);
CREATE INDEX idx_cards_column_position ON cards(column_id, position);
CREATE INDEX idx_cards_board ON cards(board_id);
```

## 6) JSON shape returned to frontend (target)

Backend can convert DB rows to this JSON:

```json
{
  "columns": [
    { "id": "col-1", "title": "Backlog", "cardIds": ["card-1", "card-2"] }
  ],
  "cards": {
    "card-1": { "id": "card-1", "title": "Task A", "details": "..." }
  }
}
```

Note:
- DB IDs may be integers internally.
- API can map them to stable string IDs if needed.

## 7) MVP seed data plan

When DB file does not exist:

1. Create tables.
2. Insert demo user (`user`) with hashed password.
3. Create one board for that user.
4. Insert 5 default columns.
5. Insert starter cards (optional, same as current demo feel).

## 8) What will happen in next step (Part 6)

- Add API to fetch full board for current user.
- Add API to update board data (move, edit, add, delete).
- Auto-create DB and seed initial data.

## 9) Approval checklist for you

Please confirm these two points:

1. Is this table-based design acceptable? (`users`, `boards`, `columns`, `cards`)
2. Is "1 board per user for MVP" acceptable, while keeping multi-user-ready structure?
