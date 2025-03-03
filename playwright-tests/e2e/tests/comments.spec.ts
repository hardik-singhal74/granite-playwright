import { expect } from "@playwright/test";
import { test } from "../fixtures";
import { faker } from "@faker-js/faker";
import LoginPage from "../poms/login";
import { TaskPage } from "../poms/tasks";
import { CommentPage } from "../poms/comments";
import { TASKS_TABLE_SELECTORS, NAVBAR_SELECTORS, CREATE_COMMENT_SELECTORS } from "../constants/selectors";

interface User {
  name: string;
  password: string;
  email: string;
}

test.describe("Adding comments to a task", () => {

  let taskName: string;
  let comment: string;
  let creator: User = {
    name: "Oliver Smith",
    password: process.env.ADMIN_PASSWORD!,
    email: process.env.ADMIN_EMAIL!,
  };
  let assignee: User = {
    name: "Sam Smith",
    password: process.env.STANDARD_PASSWORD!,
    email: process.env.STANDARD_EMAIL!,
  };

  test.beforeEach(async ({ page, loginPage, taskPage }) => {
    await test.step("Step 1: Going to the home page", () => page.goto("/"));
    test.step("Step 2: Generating task and comment", () =>{
      taskName = faker.word.words({ count: 5 });
      comment = faker.word.words({ count: 5 });
    });
    await test.step("Step 3: Logging in as creator", ()=> loginPage.loginAndVerifyUser({
      email: creator.email,
      password: creator.password,
      username: creator.name,
    }));
    await test.step("Step 4: Creating a task", ()=> taskPage.createTaskAndVerify({ taskName, userName: assignee.name }));
    await test.step("Step 5: Scrolling to the task", async ()=> {
      const taskInDashboard = await page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByText(taskName);
      await taskInDashboard.scrollIntoViewIfNeeded();
    });
  });

  test.afterEach(async ({ page, loginPage, taskPage }) => {
    await test.step("Step 1: Logining in as the creator", ()=> loginPage.logoutAndLoginAsDifferentUser({ email: creator.email, password: creator.password, username: creator.name }));
    await test.step("Step 2: Marking the task as completed", ()=> taskPage.markTaskAsCompletedAndVerify({ taskName }));
    await test.step("Step 3: Deleting the task", async ()=>{
      const completedTaskInDashboard = await page.getByTestId(TASKS_TABLE_SELECTORS.completedTasksTable).getByRole("row", { name: new RegExp(taskName, "i") });
      await completedTaskInDashboard.getByTestId(TASKS_TABLE_SELECTORS.deleteTaskButton).click();
      await expect(completedTaskInDashboard).toBeHidden();
      await expect(page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole("row", { name: new RegExp(taskName, "i") })).toBeHidden();
    });
  });

  test("should check if it persists", async ({ page, commentPage }) => {
    await test.step("Step 1: Adding a comment to the task", ()=> commentPage.addCommentToTaskAndVerify({ taskName, comment }));
    await test.step("Step 2: Checking if the comment persists", async ()=> {
      const commentInTask = await page.getByTestId(CREATE_COMMENT_SELECTORS.commentField).getByText(comment);
      await expect(commentInTask).toBeVisible();
    });
  });

  test("should check if comment appears to the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    await test.step("Step 1: Logging in as the assignee and adding a comment to the task", ()=> commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: assignee.email, password: assignee.password, username: assignee.name }));
    await test.step("Step 2: Checking if the comment appears to the assignee", async ()=> {
      await page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByText(taskName).click();
      const commentInTask = await page.getByTestId(CREATE_COMMENT_SELECTORS.commentField).getByText(comment);
      await expect(commentInTask).toBeVisible();
    });
  });

  test("should persist when added by the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    await test.step("Step 1: Logging in as the assignee", () => loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name }));
    await test.step("Step 2: Adding a comment to the task and verify", async () => {
      await commentPage.addCommentToTaskAndVerify({ taskName, comment });
      const commentInTask = await page.getByTestId(CREATE_COMMENT_SELECTORS.commentField).getByText(comment);
      await expect(commentInTask).toBeVisible();
    });
  });

  test("should be visible to the creator when added by the assignee", async ({page, loginPage, taskPage, commentPage})=>{
    await test.step("Step 1: Logging in as the assignee", () => loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name }));
    await test.step("Step 2: Adding a comment to the task then login as creator and verify", async () => {
      await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: creator.email, password: creator.password, username: creator.name});
      await page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByText(taskName).click();
      const commentInTask = await page.getByTestId(CREATE_COMMENT_SELECTORS.commentField).getByText(comment);
      await expect(commentInTask).toBeVisible();
    });
  });

  test.describe("should check if comment count increases", () => {
    let commentCount: Promise<string>, commentCountAfterAddingTask: Promise<string>;
    test.beforeEach( async ({page, taskPage, commentPage}) => {
      await test.step("Step 1: Counting the number of Comments", async () => {
        commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
      });
    });
    test.afterEach(async ({ page }) => {
      await test.step("Step 1: Checking if the comment count increased", async ()=>{
        commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3);
        await expect(commentCountAfterAddingTask).toHaveText( String( parseInt(commentCount) + 1) );
      });
    });
    test("for the user", async ({ page, taskPage, commentPage}) => {
      await test.step("Step 1: Adding new comments", () => commentPage.addCommentToTaskAndVerify({ taskName, comment }));
      await test.step("Step 2: Counting the number of comments", ()=> page.getByTestId(NAVBAR_SELECTORS.todoPageButton).click());
    });

    test("for the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
      await test.step("Step 1: Adding comment and then verifying comment count as assignee", () => commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: assignee.email, password: assignee.password, username: assignee.name }));
    });

    test("when added by the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
      await test.step("Step 1: Adding comments as an assignee", async () => {
        await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name });
        await commentPage.addCommentToTaskAndVerify({ taskName, comment });
      });
      await test.step("Step 2: Checking if the comment count increases", ()=> page.getByTestId(NAVBAR_SELECTORS.todoPageButton).click());
    });

    test("for the creator when added by the assignee", async ({page, loginPage, taskPage, commentPage})=>{
      await test.step("Step 1: Adding comment as an assignee and logging in as a creator", async () => {
        await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name });
        await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: creator.email, password: creator.password, username: creator.name});
      });
    });
  });
});
