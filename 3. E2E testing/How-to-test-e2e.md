# A Beginner's Guide to E2E Testing with Playwright

This guide provides the core principles and practices you need to start writing effective, maintainable end-to-end (E2E) tests with Playwright.

## Three Core Principles

1. **Test Like a User:** Your tests should mimic how a real user interacts with your app. Focus on what they see and do, not on the underlying code structure.

   ```javascript
   // Good: Tests what the user sees
   await page.getByRole("button", { name: "Sign in" }).click();
   await expect(page.getByText("Welcome, John!")).toBeVisible();

   // Bad: Relies on fragile CSS classes
   await page.locator(".btn-primary").click();
   ```

2. **Keep Tests Independent:** Each test should be able to run on its own, in any order, without affecting other tests. Never make one test depend on another. Use `test.beforeEach` to set up a clean state (like logging in) for every single test.

3. **One Test, One Job:** Each test should verify one specific piece of functionality. This makes tests easier to read, debug, and maintain.

   ```javascript
   // Good: Focused on a single outcome
   test("should show error for invalid credentials", async ({ page }) => {
     // ...test logic for invalid login
   });

   // Bad: Tries to test login, navigation, and profile update all at once
   test("user flow test", async ({ page }) => {
     // ...too much happening here
   });
   ```

## Writing Tests: Locators & Actions

**Locators are how you find elements on the page. Use the best ones first.**

### The Locator Priority List

1. **`getByRole`**: The best choice. It's how users and accessibility tools see the page. (e.g., `button`, `link`, `heading`).
2. **`getByLabel`**: For form fields linked to a label.
3. **`getByText`**: To find non-interactive elements by their text content.
4. **`getByTestId`**: Your fallback. Ask developers to add a `data-testid` attribute for elements that are hard to find.
5. **CSS/XPath**: Use as a last resort. They are brittle and break easily when the UI changes.

```javascript
// BEST: User-facing and resilient
await page.getByRole("button", { name: "Submit" }).click();
await page.getByLabel("Email address").fill("user@example.com");

// ACCEPTABLE: A stable fallback
await page.getByTestId("submit-button").click();

// AVOID: Brittle and likely to break
await page.locator("#submit-btn.primary.large").click();
```

**Key Feature: Auto-Waiting**
Playwright automatically waits for an element to be ready before interacting with it. You almost never need manual waits.

```javascript
// Playwright automatically waits for the button to be clickable
await page.getByRole("button", { name: "Load More" }).click();

// DO NOT DO THIS! It makes tests slow and flaky.
// await page.waitForTimeout(1000);
```

#### Organizing Your Code: The Page Object Model (POM)\*\*

To avoid repeating code and make tests easier to read, group page-specific logic into classes.

**The Rule:** Page Objects should contain **actions** (what you can _do_ on a page). The **assertions** (what you _check_) should always stay in the test file.

**Example:**

```typescript
// tests/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  // Locators are private to the class
  private emailInput = this.page.getByLabel("Email");
  private passwordInput = this.page.getByLabel("Password");
  private signInButton = this.page.getByRole("button", { name: "Sign in" });

  // Methods define actions a user can take
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async goto() {
    await this.page.goto("/login");
  }
}
```

**How to use it in a test:**

```typescript
// tests/specs/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("should redirect to dashboard after successful login", async ({
  page,
}) => {
  const loginPage = new LoginPage(page);

  // Actions are performed using the page object
  await loginPage.goto();
  await loginPage.login("user@example.com", "password123");

  // Assertions (checks) stay in the test
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByText("Welcome, User!")).toBeVisible();
});
```

## Running & Debugging

Debugging is a huge part of writing tests. Playwright has amazing tools for it. I really recommend Playwright VS Code extension for a better experience. You can read more here: <https://playwright.dev/docs/debug>.

If you are a terminal guy, here are some useful commands to run tests in different modes:

- **UI Mode (Best for writing tests):** A powerful visual tool to run and debug tests step-by-step.

  ```bash
  npx playwright test --ui
  ```

- **Codegen Mode (For writing tests):** Automatically generate test code as you interact with the browser.

  ```bash
  npx playwright codegen
  ```

- **Debug Mode (For debugging):** Run tests in a headed browser with the Playwright Inspector open.

  ```bash
  npx playwright test --debug
  ```

- **Headed Mode (Quickly see it run):** Watch the browser open and perform the test actions.

  ```bash
  npx playwright test --headed
  ```

- **Trace Viewer (For failed tests):** After a test fails (especially in CI), open the `playwright-report/index.html` file. You can view a full trace with screenshots, actions, and network requests to see exactly what went wrong. Enable it in your config:

  ```typescript
  // playwright.config.ts
  use: {
    trace: 'on-first-retry', // or 'on'
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  ```
