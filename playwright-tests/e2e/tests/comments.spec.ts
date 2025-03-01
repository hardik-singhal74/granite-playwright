import { expect } from "@playwright/test";
import { test } from "../fixtures";
import { faker } from "@faker-js/faker";
import LoginPage from "../poms/login";
import { TaskPage } from "../poms/tasks";
import { CommentPage } from "../poms/comments";

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
    password: "welcome",
    email: "oliver@example.com",
  };
  let assignee: User = {
    name: "Sam Smith",
    password: "welcome",
    email: "sam@example.com",
  };

  test.beforeEach(async ({ page, loginPage, taskPage }) => {
    await test.step("Step 1: Going to the home page", async () => await page.goto("/"));
    await test.step("Step 2: Generating task and comment", async () =>{
      taskName = faker.word.words({ count: 5 });
      comment = faker.word.words({ count: 5 });
    });
    await test.step("Step 3: Logging in as creator", async ()=> await loginPage.loginAndVerifyUser({
      email: creator.email,
      password: creator.password,
      username: creator.name,
    }));
    await test.step("Step 4: Creating a task", async ()=> await taskPage.createTaskAndVerify({ taskName, userName: assignee.name }));
    await test.step("Step 5: Scrolling to the task", async ()=> {
      const taskInDashboard = await page.getByTestId('tasks-pending-table').getByText(taskName);
      await taskInDashboard.scrollIntoViewIfNeeded();
    });
  });

  test.afterEach(async ({ page, loginPage, taskPage }) => {
    await test.step("Step 1: Logining in as the creator", async ()=> await loginPage.logoutAndLoginAsDifferentUser({ email: creator.email, password: creator.password, username: creator.name }));
    await test.step("Step 2: Marking the task as completed", async ()=>
      await taskPage.markTaskAsCompletedAndVerify({ taskName })
    );
    await test.step("Step 3: Deleting the task", async ()=>{
      const completedTaskInDashboard = await page.getByTestId("tasks-completed-table").getByRole("row", { name: new RegExp(taskName, "i") });
      await completedTaskInDashboard.getByTestId("completed-task-delete-link").click();
      await expect(completedTaskInDashboard).toBeHidden();
      await expect(page.getByTestId("tasks-pending-table").getByRole("row", { name: new RegExp(taskName, "i") })).toBeHidden();
    });
  });

  test("should check if it persists", async ({ page, commentPage }) => {
    await test.step("Step 1: Adding a comment to the task", async ()=> await commentPage.addCommentToTaskAndVerify({ taskName, comment }));
    await test.step("Step 2: Checking if the comment persists", async ()=> {
      const commentInTask = await page.getByTestId('task-comment').getByText(comment);
      await expect(commentInTask).toBeVisible();
    });
  });

  test("should check if comment appears to the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    await test.step("Step 1: Logging in as the assignee and adding a comment to the task", async ()=> {
      await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: assignee.email, password: assignee.password, username: assignee.name })
    });
    await test.step("Step 2: Checking if the comment appears to the assignee", async ()=> {
      await page.getByTestId('tasks-pending-table').getByText(taskName).click();
      const commentInTask = await page.getByTestId('task-comment').getByText(comment);
      await expect(commentInTask).toBeVisible();
    });
  });

  test("should persist when added by the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    await test.step("Step 1: Logging in as the assignee", async () => await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name }));
    await test.step("Step 2: Adding a comment to the task and verify", async () => {
      await commentPage.addCommentToTaskAndVerify({ taskName, comment });
      const commentInTask = await page.getByTestId('task-comment').getByText(comment);
      await expect(commentInTask).toBeVisible();
    });
  });

  test("should be visible to the creator when added by the assignee", async ({page, loginPage, taskPage, commentPage})=>{
    await test.step("Step 1: Logging in as the assignee", async () => await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name }));
    await test.step("Step 2: Adding a comment to the task then login as creator and verify", async () => {
      await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: creator.email, password: creator.password, username: creator.name});
      await page.getByTestId('tasks-pending-table').getByText(taskName).click();
      const commentInTask = await page.getByTestId('task-comment').getByText(comment);
      await expect(commentInTask).toBeVisible();
    });
  });

  test("should check if comment count increases", async ({ page, taskPage, commentPage}) => {
    let commentCount: Promise<string>, commentCountAfterAddingTask: Promise<string>;
    await test.step("Step 1: Counting the number of Comments", async () => {
      commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    });
    await test.step("Step 2: Adding new comments", async () => await commentPage.addCommentToTaskAndVerify({ taskName, comment }));
    await test.step("Step 3: Counting the number of comments", async ()=> {
      await page.getByTestId('navbar-todos-page-link').click();
      commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    });
    await test.step("Step 4: Checking if the comment count increased", async ()=>{
      const beforeCount = await parseInt(commentCount);
      const afterCount = await parseInt(commentCountAfterAddingTask);
      await expect(afterCount).toBe(beforeCount + 1);
    });
  });

  test("should check if comment count increases for the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    let commentCount: Promise<string>, commentCountAfterAddingTask: Promise<string>;
    await test.step("Step 1: Counting the number of Comments", async ()=>{
      commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    });
    await test.step("Step 2: Adding comment and then verifying comment count as assignee", async () => {
      await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: assignee.email, password: assignee.password, username: assignee.name });
      commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
      const beforeCount = await parseInt(commentCount);
      const afterCount = await parseInt(commentCountAfterAddingTask);
      await expect(afterCount).toBe(beforeCount + 1);
    });
  });

  test("should increase comment count when added by the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    let commentCount: Promise<string>, commentCountAfterAddingTask: Promise<string>;
    await test.step("Step 1: Counting the number of comments", async () => {
      commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    });
    await test.step("Step 2: Adding comments as an assignee", async () => {
      await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name });
      await commentPage.addCommentToTaskAndVerify({ taskName, comment });
    });
    await test.step("Step 3: Checking if the comment count increases", async ()=> {
      await page.getByTestId('navbar-todos-page-link').click();
      commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
      const beforeCount = await parseInt(commentCount);
      const afterCount = await parseInt(commentCountAfterAddingTask);
      await expect(afterCount).toBe(beforeCount + 1);
    });
  });

  test("should increase comment count for the creator when added by the assignee", async ({page, loginPage, taskPage, commentPage})=>{
    let commentCount: Promise<string>, commentCountAfterAddingTask: Promise<string>;
    await test.step("Step 1: Counting the number of comments", async () => {
      commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    });
    await test.step("Step 2: Adding comment as an assignee and logging in as a creator", async () => {
      await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name });
      await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: creator.email, password: creator.password, username: creator.name});
    });
    await test.step("Step 3: Checking if comment count increases for the creator", async () => {
      commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
      const beforeCount = await parseInt(commentCount);
      const afterCount = await parseInt(commentCountAfterAddingTask);
      await expect(afterCount).toBe(beforeCount + 1);
    });
  });
});
