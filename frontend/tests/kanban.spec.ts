import { expect, test, type Page } from "@playwright/test";

const login = async (page: Page) => {
  await page.getByLabel("User ID").fill("user");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: /sign in/i }).click();
};

test("loads the kanban board", async ({ page }) => {
  await page.goto("/");
  await login(page);
  await expect(page.getByRole("heading", { name: "Kanban Studio" })).toBeVisible();
  await expect(page.locator('[data-testid^="column-"]')).toHaveCount(5);
});

test("adds a card to a column", async ({ page }) => {
  await page.goto("/");
  await login(page);
  const firstColumn = page.locator('[data-testid^="column-"]').first();
  await firstColumn.getByRole("button", { name: /add a card/i }).click();
  await firstColumn.getByPlaceholder("Card title").fill("Playwright card");
  await firstColumn.getByPlaceholder("Details").fill("Added via e2e.");
  await firstColumn.getByRole("button", { name: /add card/i }).click();
  await expect(firstColumn.getByText("Playwright card")).toBeVisible();
});

test("renames a column", async ({ page }) => {
  await page.goto("/");
  await login(page);
  const firstColumn = page.locator('[data-testid^="column-"]').first();
  const titleInput = firstColumn.getByLabel("Column title");
  await titleInput.fill("Priority Queue");
  await expect(titleInput).toHaveValue("Priority Queue");
});

test("shows error when login fails", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("User ID").fill("wrong");
  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByText("IDかパスワードが違います。もう一度確認してください。")).toBeVisible();
});

test("shows ai assistant sidebar", async ({ page }) => {
  await page.goto("/");
  await login(page);
  await expect(page.getByText("AI Assistant")).toBeVisible();
  await expect(page.getByRole("button", { name: /ask ai/i })).toBeVisible();
});
