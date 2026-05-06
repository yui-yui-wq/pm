import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthGate } from "@/components/AuthGate";

describe("AuthGate", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("shows login form by default", () => {
    render(<AuthGate />);
    expect(screen.getByRole("heading", { name: "Kanban Studio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows an error with wrong credentials", async () => {
    const user = userEvent.setup();
    render(<AuthGate />);
    await user.type(screen.getByLabelText("User ID"), "wrong");
    await user.type(screen.getByLabelText("Password"), "bad");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText(/idかパスワードが違います/i)).toBeInTheDocument();
  });

  it("logs in and allows logout", async () => {
    const user = userEvent.setup();
    render(<AuthGate />);
    await user.type(screen.getByLabelText("User ID"), "user");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/logged in as/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /log out/i }));
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
