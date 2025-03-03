import {Page, test, expect} from '@playwright/test';
import LoginPage from "./login";
import { NAVBAR_SELECTORS, LOGIN_SELECTORS, TASKS_TABLE_SELECTORS, CREATE_COMMENT_SELECTORS } from '../constants/selectors';

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
        await this.page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByText(taskName).click();
        await this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentTextField).fill(comment);
        await this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentSubmitButton).click();
      });
      await test.step("Step 2: Checking addition of comment", async () => {
        await expect(this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentField).getByText(comment)).toBeVisible();
      });
    };

    addCommentThenLogoutAndLoginAsDifferentUser = async ({taskName, comment, email = ADMIN_EMAIL!, password = ADMIN_PASSWORD!, username = "Oliver"}:CreateNewCommentProps): Promise<void> => {
      await test.step("Step 1: Adding comment to task", async () => {
        await this.page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByText(taskName).click();
        await this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentTextField).fill(comment);
        await this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentSubmitButton).click();
      });
      await test.step("Step 2: Checking addition of comment", async () => {
        await expect(this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentField).getByText(comment)).toBeVisible();
      });
      await test.step("Step 3: Loging in new user:", async () => {
        await this.page.getByTestId(NAVBAR_SELECTORS.logoutButton).click();
        await this.loginPage.loginAndVerifyUser({email, password, username});
        await expect(this.page.getByTestId(NAVBAR_SELECTORS.usernameLabel)).toContainText(username);
      });
    };
}
