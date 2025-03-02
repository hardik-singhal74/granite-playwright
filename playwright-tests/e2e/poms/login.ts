import { Page, test, expect } from "@playwright/test";
import { LOGIN_SELECTORS, NAVBAR_SELECTORS } from "../constants/selectors";

interface LoginPageProps {
  email: string;
  username: string;
  password: string;
}
export default class LoginPage {

  constructor(private page: Page) {}

  registerUser = async ({
    email,
    password,
    username,
  }: LoginPageProps): Promise<void> => {
    await test.step("Step 1: Going to home page", async () => {
      await this.page.goto("/");
    });
    await test.step("Step 2: Filling user details", async () => {
      await this.page.getByTestId("login-register-link").click();
      await this.page.getByTestId("signup-name-field").fill(username);
      await this.page.getByTestId("signup-email-field").fill(email);
      await this.page.getByTestId("signup-password-field").fill(password);
      await this.page
        .getByTestId("signup-password-confirmation-field")
        .fill(password);
      await this.page.getByTestId("signup-submit-button").click();
    });
    await test.step("Step 3: Verifying registration of user", async () => {
      await expect(this.page.getByTestId("login-submit-button")).toBeVisible();
    });
  };
  loginAndVerifyUser = async ({
    email,
    password,
    username,
  }: LoginPageProps): Promise<void> => {
    await test.step("Step 1: Filling user details:", async () => {
      await this.page.getByTestId(LOGIN_SELECTORS.emailField).fill(email);
      await this.page.getByTestId(LOGIN_SELECTORS.passwordField).fill(password);
      await this.page.getByTestId(LOGIN_SELECTORS.loginButton).click();
    });
    await test.step("Step 2: Verifying login:", async () => {
      await expect(
        this.page.getByTestId(NAVBAR_SELECTORS.usernameLabel)
      ).toContainText(username);
      await expect(
        this.page.getByTestId(NAVBAR_SELECTORS.logoutButton)
      ).toBeVisible();
    });
  };
  logoutAndLoginAsDifferentUser = async ({ email, password, username }: LoginPageProps): Promise<void> => {
    await this.page.getByTestId("navbar-logout-link").click();
    await this.loginAndVerifyUser({ email, password, username });
  }
}
