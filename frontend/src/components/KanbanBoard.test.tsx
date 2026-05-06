import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { KanbanBoard } from "@/components/KanbanBoard";
import { initialData } from "@/lib/kanban";

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];

describe("KanbanBoard", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    global.fetch = vi.fn(async (input, init) => {
      const url = String(input);
      if (!init || init.method === "GET") {
        return new Response(JSON.stringify(initialData), { status: 200 });
      }
      if (init.method === "POST" && url.includes("/api/ai/plan")) {
        return new Response(
          JSON.stringify({ reply: "Try Review first.", board_update: null }),
          { status: 200 }
        );
      }
      return new Response(null, { status: 200 });
    }) as typeof fetch;
  });

  it("renders five columns", async () => {
    render(<KanbanBoard />);
    await screen.findByText("Kanban Studio");
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });

  it("renames a column", async () => {
    render(<KanbanBoard />);
    await screen.findByText("Kanban Studio");
    const column = getFirstColumn();
    const input = within(column).getByLabelText("Column title");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    expect(input).toHaveValue("New Name");
  });

  it("adds and removes a card", async () => {
    render(<KanbanBoard />);
    const column = getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /add a card/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(within(column).getByRole("button", { name: /add card/i }));

    expect(within(column).getByText("New card")).toBeInTheDocument();

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    expect(within(column).queryByText("New card")).not.toBeInTheDocument();
  });

  it("shows AI assistant response in sidebar", async () => {
    render(<KanbanBoard />);
    await screen.findByText("Kanban Studio");
    await userEvent.type(screen.getByPlaceholderText("例: 今のボトルネックは？"), "次に何をする？");
    await userEvent.click(screen.getByRole("button", { name: /ask ai/i }));
    expect(await screen.findByText("Try Review first.")).toBeInTheDocument();
  });
});
