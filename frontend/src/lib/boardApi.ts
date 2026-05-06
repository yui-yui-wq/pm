import { initialData, type BoardData } from "@/lib/kanban";

export const fetchBoard = async (): Promise<BoardData> => {
  const response = await fetch("/api/board", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load board");
  }
  return (await response.json()) as BoardData;
};

export const saveBoard = async (board: BoardData): Promise<void> => {
  const response = await fetch("/api/board", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(board),
  });
  if (!response.ok) {
    throw new Error("Failed to save board");
  }
};

export const fetchBoardOrFallback = async (): Promise<BoardData> => {
  try {
    return await fetchBoard();
  } catch {
    return initialData;
  }
};

export type AIHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIPlanResponse = {
  reply: string;
  board_update: BoardData | null;
};

export const requestAIPlan = async (
  question: string,
  history: AIHistoryMessage[]
): Promise<AIPlanResponse> => {
  const response = await fetch("/api/ai/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });
  if (!response.ok) {
    throw new Error("Failed to get AI plan");
  }
  return (await response.json()) as AIPlanResponse;
};
