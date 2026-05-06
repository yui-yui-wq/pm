"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCardPreview } from "@/components/KanbanCardPreview";
import { createId, initialData, moveCard, type BoardData } from "@/lib/kanban";
import {
  fetchBoardOrFallback,
  requestAIPlan,
  saveBoard,
  type AIHistoryMessage,
} from "@/lib/boardApi";

export const KanbanBoard = () => {
  const [board, setBoard] = useState<BoardData>(() => initialData);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState("Loading board...");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<AIHistoryMessage[]>([
    {
      role: "assistant",
      content: "こんにちは。看板について質問してください。必要なら更新提案を作成します。",
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const cardsById = useMemo(() => board.cards, [board.cards]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const loaded = await fetchBoardOrFallback();
      if (!cancelled) {
        setBoard(loaded);
        setLoading(false);
        setSyncMessage("Board loaded.");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAndSave = (updater: (prev: BoardData) => BoardData) => {
    let nextBoard: BoardData = board;
    setBoard((prev) => {
      nextBoard = updater(prev);
      return nextBoard;
    });
    setSyncMessage("Saving changes...");
    void saveBoard(nextBoard)
      .then(() => setSyncMessage("All changes saved."))
      .catch(() => setSyncMessage("Could not save. Changes will retry on next edit."));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over || active.id === over.id) {
      return;
    }

    applyAndSave((prev) => ({
      ...prev,
      columns: moveCard(prev.columns, active.id as string, over.id as string),
    }));
  };

  const handleRenameColumn = (columnId: string, title: string) => {
    applyAndSave((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === columnId ? { ...column, title } : column
      ),
    }));
  };

  const handleAddCard = (columnId: string, title: string, details: string) => {
    const id = createId("card");
    applyAndSave((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [id]: { id, title, details: details || "No details yet." },
      },
      columns: prev.columns.map((column) =>
        column.id === columnId
          ? { ...column, cardIds: [...column.cardIds, id] }
          : column
      ),
    }));
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    applyAndSave((prev) => {
      return {
        ...prev,
        cards: Object.fromEntries(
          Object.entries(prev.cards).filter(([id]) => id !== cardId)
        ),
        columns: prev.columns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                cardIds: column.cardIds.filter((id) => id !== cardId),
              }
            : column
        ),
      };
    });
  };

  const activeCard = activeCardId ? cardsById[activeCardId] : null;

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || chatLoading) {
      return;
    }
    const userMessage: AIHistoryMessage = { role: "user", content: question };
    const nextHistory = [...chatMessages, userMessage];
    setChatMessages(nextHistory);
    setChatInput("");
    setChatLoading(true);
    try {
      const response = await requestAIPlan(question, nextHistory);
      const assistantMessage: AIHistoryMessage = {
        role: "assistant",
        content: response.reply,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);

      if (response.board_update) {
        setBoard(response.board_update);
        setSyncMessage("Applying AI update...");
        await saveBoard(response.board_update);
        setSyncMessage("AI update applied and saved.");
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AIへの接続に失敗しました。時間をおいて再試行してください。",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="bg-[#f6f7fb]">
      <main className="mx-auto flex min-h-screen max-w-[1700px] flex-col gap-6 px-5 pb-10 pt-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
                Single Board Kanban
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy-dark)]">
                Kanban Studio
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--gray-text)]">
                Keep momentum visible. Rename columns, drag cards between stages,
                and capture quick notes without getting buried in settings.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
                Focus
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--primary-blue)]">
                One board. Five columns. Zero clutter.
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gray-text)]">
                {loading ? "Loading..." : syncMessage}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {board.columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--navy-dark)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--accent-yellow)]" />
                {column.title}
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <section className="flex gap-4 overflow-x-auto pb-2">
              {board.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={column.cardIds.map((cardId) => board.cards[cardId])}
                  onRename={handleRenameColumn}
                  onAddCard={handleAddCard}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
            </section>
            <DragOverlay>
              {activeCard ? (
                <div className="w-[260px]">
                  <KanbanCardPreview card={activeCard} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <aside className="flex h-[calc(100vh-250px)] min-h-[560px] flex-col rounded-xl border border-[#e5e8f0] bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gray-text)]">
              AI Assistant
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--navy-dark)]">
              Ask about priorities and next actions
            </p>
            <div className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-md bg-[#f8f9fc] p-2">
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-6 rounded-md bg-[var(--primary-blue)] px-3 py-2 text-xs text-white"
                      : "mr-6 rounded-md border border-[#e5e8f0] bg-white px-3 py-2 text-xs text-[var(--navy-dark)]"
                  }
                >
                  {message.content}
                </div>
              ))}
              {chatLoading ? (
                <div className="mr-6 rounded-md border border-[#e5e8f0] bg-white px-3 py-2 text-xs text-[var(--gray-text)]">
                  Thinking...
                </div>
              ) : null}
            </div>
            <form className="mt-3 space-y-2" onSubmit={handleChatSubmit}>
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="例: 今のボトルネックは？"
                rows={3}
                className="w-full resize-none rounded-md border border-[var(--stroke)] bg-white px-3 py-2 text-xs text-[var(--navy-dark)] outline-none transition focus:border-[var(--primary-blue)]"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="w-full rounded-md bg-[var(--secondary-purple)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {chatLoading ? "Sending..." : "Ask AI"}
              </button>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
};
