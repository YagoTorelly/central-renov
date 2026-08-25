import { expect, test } from "@playwright/test";

test("exibe a aplicação e a conexão local", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Gerenciador de Leads WTG" }),
  ).toBeVisible();
  await expect(page.getByText("Supabase local conectado")).toBeVisible();
});
