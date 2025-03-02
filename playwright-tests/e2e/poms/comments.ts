import {Page, test, expect} from '@playwright/test';
import LoginPage from "./login";

interface TaskAndCommentName {
  taskName: string;
  comment: string;

}
interface CreateNewCommentProps extends TaskAndCommentName {
  email?: string;
  password?: string;
  username?: string;
}

export class CommentPage {
    page: Page;
    loginPage: LoginPage;

    constructor(page:Page){
      this.page = page;
      this.loginPage = new LoginPage(page);
    }

    addCommentToTaskAndVerify = async ({taskName, comment}:TaskAndCommentName): Promise<void> => {
      await test.step("Step 1: Adding comment to task", async () => {
        await this.page.getByTestId('tasks-pending-table').getByText(taskName).click();
        await this.page.getByTestId('comments-text-field').fill(comment);
        await this.page.getByTestId('comments-submit-button').click();
      });
      await test.step("Step 2: Checking addition of comment", async () => {
        await expect(this.page.getByTestId('task-comment').getByText(comment)).toBeVisible();
      });
    };

    addCommentThenLogoutAndLoginAsDifferentUser = async ({taskName, comment, email = "oliver@example.com", password = "welcome", username = "Oliver"}:CreateNewCommentProps): Promise<void> => {
      await test.step("Step 1: Adding comment to task", async () => {
        await this.page.getByTestId('tasks-pending-table').getByText(taskName).click();
        await this.page.getByTestId('comments-text-field').fill(comment);
        await this.page.getByTestId('comments-submit-button').click();
      });
      await test.step("Step 2: Checking addition of comment", async () => {
        await expect(this.page.getByTestId('task-comment').getByText(comment)).toBeVisible();
      });
      await test.step("Step 3: Loging in new user:", async () => {
        await this.page.getByTestId("navbar-logout-link").click();
        await this.loginPage.loginAndVerifyUser({email, password, username});
        await expect(this.page.getByTestId("navbar-username-label")).toContainText(username);
      });
    };
}
