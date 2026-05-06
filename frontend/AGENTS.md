# Frontend Overview

This directory contains the existing frontend-only Kanban MVP built with Next.js.

**概要（日本語）:** このフォルダは、Next.js で作った「フロントだけの」Kanban MVP です。バックエンドとはまだつながっていません。

## Purpose

- Show a single Kanban board at `/`
- Allow column renaming
- Allow card drag-and-drop movement
- Allow creating and deleting cards
- Run without backend integration (state is in-memory)

**目的（日本語）:**

- `/` で1枚の Kanban を表示する
- 列名の変更ができる
- カードのドラッグ＆ドロップで移動できる
- カードの追加・削除ができる
- バックエンドなしで動く（データはブラウザ内メモリのみ）

## Stack

- Next.js (App Router)
- React
- TypeScript
- `@dnd-kit` for drag-and-drop
- Tailwind CSS
- Vitest + Testing Library (unit tests)
- Playwright (end-to-end tests)

**技術スタック（日本語）:** Next.js（App Router）、React、TypeScript、ドラッグ用 `@dnd-kit`、Tailwind CSS、単体テストに Vitest と Testing Library、E2E に Playwright。

## Key Files

- `src/app/page.tsx`: app entry page; renders the Kanban board
- `src/components/KanbanBoard.tsx`: main board state and interactions
- `src/components/KanbanColumn.tsx`: column rendering and per-column actions
- `src/components/KanbanCard.tsx`: card UI and drag behavior
- `src/lib/kanban.ts`: core board types, initial demo data, card move logic

**主要ファイル（日本語）:**

- `src/app/page.tsx` … アプリの入口。Kanban を表示
- `src/components/KanbanBoard.tsx` … ボードの状態と操作の中心
- `src/components/KanbanColumn.tsx` … 列の表示と列ごとの操作
- `src/components/KanbanCard.tsx` … カードの見た目とドラッグ
- `src/lib/kanban.ts` … 型、初期デモデータ、カード移動のロジック

## Current Behavior

- Board data is initialized from `initialData` in `src/lib/kanban.ts`
- Data changes are stored in React state only
- Refreshing the browser resets board state to defaults
- Login is required before board access (`user` / `password` for MVP)
- Login state is session-based in browser storage
- No backend API calls yet
- No AI chat yet

**現在の動き（日本語）:**

- ボードは `src/lib/kanban.ts` の `initialData` から始まる
- 変更は React の state にだけ保存される
- ブラウザを再読み込みすると初期データに戻る
- 認証はまだない
- バックエンド API 呼び出しはまだない
- AI チャットはまだない

## Scripts

- `npm run dev`: start local development server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run test:unit`: run unit tests
- `npm run test:e2e`: run Playwright tests
- `npm run test:all`: run all tests

**コマンド（日本語）:** `npm run dev` で開発サーバー、`build` / `start` で本番ビルドと起動、`lint` で静的解析、`test:unit` / `test:e2e` / `test:all` でテスト。

## Notes for Future Integration

- This frontend is a good baseline for Parts 3, 4, and 7+ of `docs/PLAN.md`
- Backend persistence, auth, and AI will be layered on top of current UI behavior

**今後（日本語）:** `docs/PLAN.md` のパート 3・4・7 以降で、この UI の上に永続化・認証・AI を載せていく前提のコードです。
