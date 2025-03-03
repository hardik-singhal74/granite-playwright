import { Page, test, expect } from "@playwright/test";
import { LOGIN_SELECTORS, NAVBAR_SELECTORS, SIGNUP_SELECTORS } from "../constants/selectors";

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
      await this.page.getByTestId(LOGIN_SELECTORS.registerButton).click();
      await this.page.getByTestId(SIGNUP_SELECTORS.nameField).fill(username);
      await this.page.getByTestId(SIGNUP_SELECTORS.emailField).fill(email);
      await this.page.getByTestId(SIGNUP_SELECTORS.passwordField).fill(password);
      await this.page
        .getByTestId(SIGNUP_SELECTORS.passwordConfirmationField)
        .fill(password);
      await this.page.getByTestId(SIGNUP_SELECTORS.signupButton).click();
    });
    await test.step("Step 3: Verifying registration of user", () => expect(this.page.getByTestId(
        LOGIN_SELECTORS.loginButton
      )).toBeVisible());
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
    await test.step("Step 1: Login out to home page", () => this.page.getByTestId(NAVBAR_SELECTORS.logoutButton).click());
    await test.step("Step 2: Login as another user", () => this.loginAndVerifyUser({ email, password, username }));
  }
}
