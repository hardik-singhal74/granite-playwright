import { Page, expect } from "@playwright/test";

export default class LoginPage {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  registerUser = async ({
    email,
    password,
    username,
  }: {
    email: string;
    password: string;
    username: string;
  }): Promise<void> => {
    await this.page.goto("/");
    await this.page.getByTestId("login-register-link").click();
    await this.page.getByTestId("signup-name-field").fill(username);
    await this.page.getByTestId("signup-email-field").fill(email);
    await this.page.getByTestId("signup-password-field").fill(password);
    await this.page
      .getByTestId("signup-password-confirmation-field")
      .fill(password);
    await this.page.getByTestId("signup-submit-button").click();
    await expect(this.page.getByTestId("login-submit-button")).toBeVisible();
  };
  loginAndVerifyUser = async ({
    email,
    password,
    username,
  }: {
    email: string;
    password: string;
    username: string;
  }): Promise<void> => {
    await this.page.getByTestId("login-email-field").fill(email);
    await this.page.getByTestId("login-password-field").fill(password);
    await this.page.getByTestId("login-submit-button").click();
    await expect(this.page.getByTestId("navbar-username-label")).toContainText(
      username
    );
    await expect(this.page.getByTestId("navbar-logout-link")).toBeVisible();
  };
  logoutAndLoginAsDifferentUser = async ({ email, password, username }: {
    email: string;
    password: string;
    username: string;
  }): Promise<void> => {
    await this.page.getByTestId("navbar-logout-link").click();
    await this.loginAndVerifyUser({ email, password, username });
  }
}
