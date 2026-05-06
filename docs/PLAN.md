# Project Plan (Non-Engineer Friendly)

This document is a step-by-step checklist for building the MVP.
Each part includes:
- What we are trying to achieve
- Work checklist
- How to test it
- Success criteria

**日本語:** MVP を作るための手順チェックリストです。各パートに「何を達成するか」「作業」「テスト」「成功条件」を書いています。

We will only move to the next part after your approval.

**日本語:** 次のパートに進む前に、必ずあなたの承認をもらいます。

## Quick View (Read This First)

- Project status: MVP Part 1 to Part 10 are implemented.
- Current result: Login, persistent Kanban, backend APIs, AI connectivity, structured AI planning, and AI sidebar chat are all in place.
- Verification style: every step was tested with unit/integration/e2e checks.
- If something looks off in UI, run:
  - `./scripts/stop.sh`
  - `./scripts/start.sh`
  - hard refresh browser (`Shift + Reload`)

## 先にここだけ読む（日本語）

- 進捗: Part 1 から Part 10 まで実装済みです。
- 現在の状態: ログイン、永続化Kanban、API、AI接続、構造化AI提案、AIチャットサイドバーまで揃っています。
- 確認方法: 各ステップでテスト（単体・結合・E2E）を実施済みです。
- 画面反映がずれる場合:
  - `./scripts/stop.sh`
  - `./scripts/start.sh`
  - ブラウザを強制再読み込み（`Shift + Reload`）

## Navigation

- Part 1-4: Foundation (plan, Docker, frontend serving, login)
- Part 5-7: Data model and persistence
- Part 8-10: AI connectivity, structured planning, chat UI integration

## Part 1: Planning and Alignment

**Goal:** Turn this plan into a clear execution checklist and align expectations.

**目的（日本語）:** この計画を実行しやすいチェックリストにし、認識をそろえる。

### Checklist
- [x] Rewrite this plan with clear substeps, test plan, and success criteria for each part
- [x] Add `frontend/AGENTS.md` describing the current frontend code and structure
- [x] Confirm scope and sequencing with user

### チェックリスト（日本語）
- [x] 各パートに小さな手順・テスト・成功条件を書く
- [x] 現状のフロント説明として `frontend/AGENTS.md` を用意する
- [x] 範囲と順番を利用者と確認する

### Test
- [x] Read through this file from top to bottom and confirm every part is understandable to a non-engineer

### テスト（日本語）
- [x] このファイルを上から読み、非エンジニアにも分かるか確認する

### Success Criteria
- [x] User confirms the plan is clear and approved

### 成功条件（日本語）
- [x] 利用者が計画の明確さに同意し、承認した

## Part 2: Scaffolding (Docker + Backend Skeleton)

**Goal:** Prove the app can run locally in Docker with a minimal backend and one API route.

**目的（日本語）:** Docker でローカル起動でき、最小のバックエンドと API が動くことを示す。

### Checklist
- [x] Create Docker setup for app runtime
- [x] Create FastAPI backend in `backend/`
- [x] Create start/stop scripts in `scripts/` for Mac/Windows/Linux
- [x] Serve a simple static "hello world" page from backend
- [x] Add one API endpoint that returns a simple JSON response

### チェックリスト（日本語）
- [x] アプリ用の Docker 構成を作る
- [x] `backend/` に FastAPI を置く
- [x] Mac / Windows / Linux 向けの起動・停止スクリプトを `scripts/` に置く
- [x] バックエンドから簡単な「hello world」静的ページを出す
- [x] 簡単な JSON を返す API エンドポイントを1つ追加する

### Test
- [x] Run start script and confirm container starts without errors
- [x] Open app in browser and see "hello world" page
- [x] Call API endpoint and confirm expected JSON response

### テスト（日本語）
- [x] 起動スクリプトを実行し、コンテナがエラーなく立ち上がることを確認する
- [x] ブラウザでアプリを開き、「hello world」ページが見えることを確認する
- [x] API を呼び、期待どおりの JSON が返ることを確認する

### Success Criteria
- [x] Docker-based local run works end-to-end
- [x] Page rendering and API response both confirmed

### 成功条件（日本語）
- [x] Docker でローカル実行が最後まで通る
- [x] ページ表示と API 応答の両方を確認できた

## Part 3: Frontend Integration (Show Existing Kanban)

**Goal:** Serve the existing frontend demo from the backend so `/` shows the Kanban.

**目的（日本語）:** 既存のフロントデモをバックエンドから配信し、`/` で Kanban を表示する。

### Checklist
- [x] Build frontend as static assets
- [x] Configure backend to serve built frontend at `/`
- [x] Ensure routing works for the demo entry point
- [x] Add unit/integration tests for serving and page load

### チェックリスト（日本語）
- [x] フロントを静的ファイルとしてビルドする
- [x] ビルド結果をバックエンドが `/` で配信するよう設定する
- [x] デモの入口となるルーティングが動くようにする
- [x] 配信とページ表示のユニット／結合テストを追加する

### Test
- [x] Open `/` and confirm Kanban board appears
- [x] Run frontend and backend tests for integration

### テスト（日本語）
- [x] `/` を開き、Kanban が表示されることを確認する
- [x] フロントとバックエンドの結合テストを実行する

### Success Criteria
- [x] Kanban demo is visible from Dockerized app at `/`
- [x] Relevant tests pass

### 成功条件（日本語）
- [x] Docker 化したアプリの `/` で Kanban デモが見える
- [x] 関連テストが通る

### What We Did (Beginner Notes)
- We changed the frontend build setting so Next.js outputs static files (`frontend/out`).
- During Docker build, those static files are copied into backend static folder.
- FastAPI now serves that static folder at `/`, so opening the app shows the Kanban UI.
- We kept API routes (`/api/health`) working while serving the frontend from the same app.

### 実施メモ（超初心者向け）
- Next.js の設定を変えて、フロントを「静的ファイル（配れる形）」に変換できるようにしました。
- Docker でアプリを作るときに、その静的ファイルをバックエンド側へコピーするようにしました。
- FastAPI が `/` でそのファイルを配信するため、ブラウザで開くと Kanban 画面が表示されます。
- 同時に `/api/health` も使える状態を保っています（画面と API が同居）。

### Executed Tests
- Frontend unit tests: `npm run test:unit` (pass)
- Backend unit tests: `python3 -m uv run --directory backend pytest` (pass)
- Docker integration check:
  - `./scripts/start.sh`
  - Verify `/` contains `Kanban Studio` and `_next/`
  - Verify `/api/health` returns expected JSON
  - `./scripts/stop.sh`

### 実行したテスト（日本語）
- フロント単体テスト: `npm run test:unit`（成功）
- バックエンド単体テスト: `python3 -m uv run --directory backend pytest`（成功）
- Docker 結合確認:
  - `./scripts/start.sh`
  - `/` に `Kanban Studio` と `_next/` が含まれることを確認
  - `/api/health` が想定 JSON を返すことを確認
  - `./scripts/stop.sh`

## Part 4: Fake Sign-In Flow

**Goal:** Add MVP authentication flow with fixed credentials.

**目的（日本語）:** 固定の ID／パスワードで MVP 向けログイン動線を追加する。

### Checklist
- [x] Show login screen before accessing board
- [x] Accept only `user` / `password`
- [x] Keep logged-in state for session
- [x] Add logout function
- [x] Add tests for login success/failure and logout

### チェックリスト（日本語）
- [x] ボードの前にログイン画面を出す
- [x] `user` / `password` のみ受け付ける
- [x] セッション中はログイン状態を保つ
- [x] ログアウトを実装する
- [x] ログイン成功／失敗とログアウトのテストを追加する

### Test
- [x] Attempt wrong credentials and confirm rejection
- [x] Use correct credentials and confirm board access
- [x] Logout and confirm return to login screen

### テスト（日本語）
- [x] 誤った認証情報で拒否されることを確認する
- [x] 正しい認証情報でボードに入れることを確認する
- [x] ログアウト後にログイン画面に戻ることを確認する

### Success Criteria
- [x] Sign-in/sign-out behavior matches MVP requirement
- [x] Authentication tests pass

### 成功条件（日本語）
- [x] サインイン／サインアウトが MVP 要件どおりである
- [x] 認証まわりのテストが通る

### UX Checks (User Should Not Get Lost)
- Login screen explains what to do first ("Sign In Required").
- Demo credentials are shown on screen to remove guesswork.
- Wrong credentials show immediate, clear error text.
- After login, header shows current status ("Logged in as user").
- Logout button is always visible and returns to login screen.

### 迷わないための確認（日本語）
- 最初にやることが分かるよう、ログイン画面に "Sign In Required" を表示。
- 推測しなくてよいよう、画面内にテスト用 ID/Password を明示。
- 認証失敗時はその場で分かりやすいエラーメッセージを表示。
- ログイン後は "Logged in as user" で現在状態を明示。
- ログアウトボタンを常時表示し、押すとログイン画面へ戻る。

### Executed Tests
- Frontend unit tests (`npm run test:unit`): pass
- Backend unit tests (`python3 -m uv run --directory backend pytest`): pass
- Frontend e2e tests (`npm run test:e2e`): pass

### 実行したテスト（日本語）
- フロント単体テスト（`npm run test:unit`）: 成功
- バックエンド単体テスト（`python3 -m uv run --directory backend pytest`）: 成功
- フロント E2E テスト（`npm run test:e2e`）: 成功

## Part 5: Database Modeling

**Goal:** Define how Kanban data is stored in SQLite (JSON-friendly design).

**目的（日本語）:** Kanban データを SQLite にどう保存するか（JSON も扱いやすい形）を決める。

### Checklist
- [x] Propose schema for users, board, columns, and cards
- [x] Ensure design supports one board per user (MVP) and multi-user future
- [x] Document schema and rationale in `docs/`
- [ ] Get explicit user sign-off before implementation

### チェックリスト（日本語）
- [x] ユーザー・ボード・列・カードのスキーマ案を出す
- [x] MVP はユーザー1人あたり1ボード、将来は複数ユーザーを想定できるようにする
- [x] スキーマと理由を `docs/` に書く
- [ ] 実装前に利用者の明示的な承認を得る

### Test
- [ ] Review schema document for clarity and completeness
- [ ] Validate schema can represent board state and card updates

### テスト（日本語）
- [ ] スキーマ文書が分かりやすく十分かレビューする
- [ ] ボード状態やカード更新を表現できるか検証する

### Success Criteria
- [ ] User approves documented database approach

### 成功条件（日本語）
- [ ] 利用者が文書化した DB 方針に同意した

## Part 6: Backend CRUD APIs

**Goal:** Implement backend APIs to read and update a user's Kanban board.

**目的（日本語）:** ユーザーの Kanban を読み書きするバックエンド API を実装する。

### Checklist
- [x] Implement API route(s) to fetch board data
- [x] Implement API route(s) to update board data
- [x] Ensure database file is created automatically if missing
- [x] Add backend unit tests for happy path and failure cases

### チェックリスト（日本語）
- [x] ボード取得用の API を実装する
- [x] ボード更新用の API を実装する
- [x] DB ファイルが無いときは自動作成する
- [x] 正常系と失敗系のバックエンド単体テストを追加する

### Test
- [x] Call read API and verify returned board data
- [x] Call update API and verify persistence in database
- [x] Run backend test suite

### テスト（日本語）
- [x] 読み取り API を呼び、返るボードデータを確認する
- [x] 更新 API を呼び、DB に保存されることを確認する
- [x] バックエンドのテスト一式を実行する

### Success Criteria
- [x] Board read/update APIs work reliably
- [x] Backend tests pass

### 成功条件（日本語）
- [x] ボードの読み書き API が安定して動く
- [x] バックエンドのテストが通る

### What We Did (Beginner Notes)
- Added a local SQLite database file that is auto-created when needed.
- Added API to read board data: `GET /api/board`.
- Added API to save board data: `PUT /api/board`.
- On first run, backend creates base tables and demo data automatically.

### 実施メモ（超初心者向け）
- ローカル保存用に SQLite を使い、必要ならDBファイルを自動作成するようにしました。
- ボードを読む API（`GET /api/board`）を追加しました。
- ボードを保存する API（`PUT /api/board`）を追加しました。
- 初回起動時に、テーブルとデモデータが自動で作られます。

## Part 7: Connect Frontend to Backend

**Goal:** Replace frontend demo-only state with persistent backend state.

**目的（日本語）:** フロントのデモ用メモリ状態を、バックエンド永続データに置き換える。

### Checklist
- [x] Wire frontend data loading to backend read API
- [x] Wire frontend edits/moves to backend update API
- [x] Handle loading and error states simply
- [x] Add integration tests for persistence flow

### チェックリスト（日本語）
- [x] フロントのデータ読み込みを読み取り API に接続する
- [x] 編集・移動を更新 API に接続する
- [x] 読み込み中とエラーをシンプルに扱う
- [x] 永続化の流れの結合テストを追加する

### Test
- [x] Edit board, refresh page, and confirm changes remain
- [x] Run frontend-backend integration tests

### テスト（日本語）
- [x] ボードを編集し、再読み込み後も変更が残ることを確認する
- [x] フロントとバックエンドの結合テストを実行する

### Success Criteria
- [x] Kanban board persists across page reloads
- [x] Integration tests pass

### 成功条件（日本語）
- [x] ページを再読み込みしても Kanban が保持される
- [x] 結合テストが通る

### What We Did (Beginner Notes)
- Frontend now reads board data from backend API (`GET /api/board`) on load.
- Every board change now sends save request to backend (`PUT /api/board`).
- UI shows simple sync status messages (loading/saving/saved/error).
- This makes board changes survive refresh.

### 実施メモ（超初心者向け）
- 画面を開いたとき、バックエンドからボードを読むようにしました（`GET /api/board`）。
- カード追加・削除・移動・列名変更のたびに、保存APIへ送るようにしました（`PUT /api/board`）。
- ユーザーが迷わないように、画面上に「読み込み中」「保存中」「保存完了」「保存失敗」を表示します。
- これで再読み込みしても変更が残ります。

### Executed Tests
- Frontend unit tests: `npm run test:unit` (pass)
- Frontend e2e tests: `npm run test:e2e` (pass)
- Backend unit tests: `python3 -m uv run --directory backend pytest` (pass)
- Docker persistence check:
  - Update board via `PUT /api/board`
  - Read again via `GET /api/board`
  - Confirm updated title is still present (`PERSISTED=True`)

### 実行したテスト（日本語）
- フロント単体テスト（`npm run test:unit`）: 成功
- フロントE2E（`npm run test:e2e`）: 成功
- バックエンド単体テスト（`python3 -m uv run --directory backend pytest`）: 成功
- Docker永続化確認:
  - `PUT /api/board` で更新
  - `GET /api/board` で再取得
  - 更新内容が残っていることを確認（`PERSISTED=True`）

## Part 8: AI Connectivity (OpenRouter)

**Goal:** Confirm backend can call AI model through OpenRouter.

**目的（日本語）:** バックエンドから OpenRouter 経由で AI モデルを呼べることを確認する。

### Checklist
- [x] Add OpenRouter client setup in backend
- [x] Read `OPENROUTER_API_KEY` from `.env`
- [x] Call model with a simple prompt (using free router for no-cost testing)
- [x] Add connectivity test path using "2+2" prompt

### チェックリスト（日本語）
- [x] バックエンドに OpenRouter クライアント設定を追加する
- [x] `.env` から `OPENROUTER_API_KEY` を読む
- [x] 無料確認のため free ルーターで簡単なプロンプトを呼ぶ
- [x] 「2+2」などで接続確認するテスト経路を追加する

### Test
- [x] Execute connectivity call and verify response is returned
- [x] Confirm error handling if API key is missing/invalid

### テスト（日本語）
- [x] 接続用の呼び出しを実行し、応答が返ることを確認する
- [x] API キーが無い／無効なときのエラー処理を確認する

### Success Criteria
- [x] AI call succeeds in local environment
- [x] Connectivity checks pass

### 成功条件（日本語）
- [x] ローカル環境で AI 呼び出しが成功する
- [x] 接続確認が通る

### What We Did (Beginner Notes)
- Added backend endpoint `GET /api/ai/test` for simple AI connectivity checks.
- Added OpenRouter call logic with environment-based model selection.
- Added clear error when API key is not set.
- Connected Docker to `.env` so API key/model are available in container.

### 実施メモ（超初心者向け）
- AI接続確認用に `GET /api/ai/test` を追加しました。
- OpenRouter を呼ぶ処理を追加し、モデルは環境変数で切り替え可能にしました。
- APIキー未設定時は分かりやすいエラーを返すようにしました。
- Docker から `.env` を読み込むようにして、コンテナ内でもキーが使えるようにしました。

### Executed Tests
- Backend tests (`python3 -m uv run --directory backend pytest`): pass
- Live connectivity (`GET /api/ai/test?question=2+2`): returned JSON response with `ok=true`
- Missing-key test: returns explicit 400 error

### 実行したテスト（日本語）
- バックエンドテスト（`python3 -m uv run --directory backend pytest`）: 成功
- 実接続テスト（`GET /api/ai/test?question=2+2`）: `ok=true` のJSON応答を確認
- キー未設定テスト: 明示的な400エラーを確認

## Part 9: Structured AI Response with Board Context

**Goal:** Send board + question + history to AI and receive structured output.

**目的（日本語）:** ボード・質問・会話履歴を AI に送り、構造化された応答を受け取る。

### Checklist
- [x] Define structured output format:
  - [x] Natural language reply for user
  - [x] Optional board update payload
- [x] Send current board JSON and conversation history with user prompt
- [x] Validate AI response format before applying updates
- [x] Add tests for:
  - [x] Reply-only response
  - [x] Reply + board update response
  - [x] Invalid structured response

### チェックリスト（日本語）
- [x] 構造化出力の形式を定義する:
  - [x] ユーザー向けの自然文の返答
  - [x] 任意のボード更新ペイロード
- [x] 現在のボード JSON と会話履歴をユーザーのプロンプトと一緒に送る
- [x] 更新を適用する前に AI 応答形式を検証する
- [x] 次のテストを追加する:
  - [x] 返答のみ
  - [x] 返答＋ボード更新
  - [x] 無効な構造化応答

### Test
- [x] Run backend tests that simulate AI responses
- [x] Confirm board updates are only applied when payload is valid

### テスト（日本語）
- [x] AI 応答を模したバックエンドテストを実行する
- [x] ペイロードが有効なときだけボード更新が適用されることを確認する

### Success Criteria
- [x] Structured output flow is stable and test-covered

### 成功条件（日本語）
- [x] 構造化出力の流れが安定し、テストでカバーされている

### What We Did (Beginner Notes)
- Added `POST /api/ai/plan` endpoint for AI planning based on:
  - current board JSON
  - user question
  - conversation history
- Backend now asks AI to return JSON in a fixed shape:
  - `reply` (message for user)
  - `board_update` (optional board JSON proposal)
- If AI returns invalid JSON, backend safely falls back to:
  - `reply` = raw AI text
  - `board_update` = null
- In this step, backend only returns proposal and does not auto-apply board updates.

### 実施メモ（超初心者向け）
- `POST /api/ai/plan` を追加し、次をAIに渡して提案を返すようにしました:
  - 現在の看板データ（JSON）
  - ユーザーの質問
  - 会話履歴
- AIの返却形式は固定です:
  - `reply`（人向けの返答）
  - `board_update`（必要な場合だけ更新案）
- AIの返答が壊れていても、バックエンド側で安全に処理します:
  - `reply` に生テキストを入れる
  - `board_update` は `null` にする
- この段階では、更新案は自動適用せず「提案のみ」です。

### Executed Tests
- Backend tests (`python3 -m uv run --directory backend pytest`): pass (9 tests)
- Live planner call (`POST /api/ai/plan`): returns structured JSON with `reply` and `board_update`

### 実行したテスト（日本語）
- バックエンドテスト（`python3 -m uv run --directory backend pytest`）: 成功（9件）
- 実接続テスト（`POST /api/ai/plan`）: `reply` と `board_update` を含むJSONを確認

## Part 10: AI Chat Sidebar in UI

**Goal:** Add user-facing AI chat sidebar that can update the board.

**目的（日本語）:** ボードを更新できる AI チャット用サイドバーを UI に追加する。

### Checklist
- [x] Create sidebar chat UI in frontend
- [x] Send chat messages to backend AI endpoint
- [x] Display assistant responses in conversation thread
- [x] Apply board updates from valid AI structured output
- [x] Refresh UI state automatically after AI-triggered update
- [x] Add integration and UI tests

### チェックリスト（日本語）
- [x] フロントにサイドバーのチャット UI を作る
- [x] メッセージをバックエンドの AI エンドポイントへ送る
- [x] アシスタントの返答を会話として表示する
- [x] 有効な構造化出力からボード更新を適用する
- [x] AI が更新したあと UI が自動で最新状態になる
- [x] 結合テストと UI テストを追加する

### Test
- [x] Ask normal question and confirm chat response appears
- [x] Ask board-editing instruction and confirm board updates visually
- [x] Reload page and confirm AI-applied board changes persist

### テスト（日本語）
- [x] 通常の質問でチャット応答が表示されることを確認する
- [x] ボード編集の指示で画面上のボードが変わることを確認する
- [x] 再読み込み後も AI が反映した変更が残ることを確認する

### Success Criteria
- [x] Chat UX works end-to-end
- [x] AI can optionally update Kanban safely
- [x] All relevant tests pass

### 成功条件（日本語）
- [x] チャット体験が最後まで通る
- [x] AI が必要に応じて Kanban を安全に更新できる
- [x] 関連テストがすべて通る

### What We Did (Beginner Notes)
- Added an AI chat sidebar to the right side of the Kanban board.
- Chat messages are sent to backend endpoint `POST /api/ai/plan`.
- Assistant replies are shown in the sidebar conversation.
- If AI returns a valid `board_update`, frontend applies it and saves it.
- UI shows save status so users can see when AI updates are persisted.

### 実施メモ（超初心者向け）
- Kanban 画面の右側に AI チャット欄を追加しました。
- 入力したメッセージは `POST /api/ai/plan` に送られます。
- AI の返答はチャット欄に表示されます。
- AI が有効な `board_update` を返した場合は、画面に反映して保存します。
- 保存状態は上部ステータスに表示されるので、反映完了が分かります。

### Executed Tests
- Frontend unit tests: `npm run test:unit` (pass, 10 tests)
- Frontend e2e tests: `npm run test:e2e` (pass, 5 tests)
- Backend tests: `python3 -m uv run --directory backend pytest` (pass, 9 tests)

### 実行したテスト（日本語）
- フロント単体テスト（`npm run test:unit`）: 成功（10件）
- フロントE2Eテスト（`npm run test:e2e`）: 成功（5件）
- バックエンドテスト（`python3 -m uv run --directory backend pytest`）: 成功（9件）
