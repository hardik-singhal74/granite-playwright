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
    await page.goto("/");
    taskName = faker.word.words({ count: 5 });
    comment = faker.word.words({ count: 5 });
    await loginPage.loginAndVerifyUser({
      email: creator.email,
      password: creator.password,
      username: creator.name,
    });
    await taskPage.createTaskAndVerify({ taskName, userName: assignee.name });
    const taskInDashboard = page.getByTestId('tasks-pending-table').getByText(taskName);
    await taskInDashboard.scrollIntoViewIfNeeded();
  });
  test.afterEach(async ({ page, loginPage, taskPage }) => {
    await loginPage.logoutAndLoginAsDifferentUser({ email: creator.email, password: creator.password, username: creator.name });
    await taskPage.markTaskAsCompletedAndVerify({ taskName });
    const completedTaskInDashboard = await page.getByTestId("tasks-completed-table").getByRole("row", { name: new RegExp(taskName, "i") });
    await completedTaskInDashboard.getByTestId("completed-task-delete-link").click();
    await expect(completedTaskInDashboard).toBeHidden();
    await expect(page.getByTestId("tasks-pending-table").getByRole("row", { name: new RegExp(taskName, "i") })).toBeHidden();
  });

  test("should check if it persists", async ({ page, commentPage }) => {
    await commentPage.addCommentToTaskAndVerify({ taskName, comment });
    const commentInTask = page.getByTestId('task-comment').getByText(comment);
    await expect(commentInTask).toBeVisible();
  });

  test("should check if comment appears to the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: assignee.email, password: assignee.password, username: assignee.name });
    await page.getByTestId('tasks-pending-table').getByText(taskName).click();
    const commentInTask = page.getByTestId('task-comment').getByText(comment);
    expect(commentInTask).toBeVisible();
  });

  test("should persist when added by the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name });
    await commentPage.addCommentToTaskAndVerify({ taskName, comment });
    const commentInTask = page.getByTestId('task-comment').getByText(comment);
    expect(commentInTask).toBeVisible();
  });

  test("should be visible to the creator when added by the assignee", async ({page, loginPage, taskPage, commentPage})=>{
    await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name });
    await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: creator.email, password: creator.password, username: creator.name});
    await page.getByTestId('tasks-pending-table').getByText(taskName).click();
    const commentInTask = page.getByTestId('task-comment').getByText(comment);
    expect(commentInTask).toBeVisible();
  });

  test("should check if comment count increases", async ({ page, taskPage, commentPage}) => {
    const commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    await commentPage.addCommentToTaskAndVerify({ taskName, comment });
    await page.getByTestId('navbar-todos-page-link').click();
    const commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    const beforeCount = parseInt(commentCount);
    const afterCount = parseInt(commentCountAfterAddingTask);
    expect(afterCount).toBe(beforeCount + 1);
  });

  test("should check if comment count increases for the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    const commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: assignee.email, password: assignee.password, username: assignee.name });
    const commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    const beforeCount = parseInt(commentCount);
    const afterCount = parseInt(commentCountAfterAddingTask);
    expect(afterCount).toBe(beforeCount + 1);
  });

  test("should increase comment count when added by the assignee", async ({ page, loginPage, taskPage, commentPage }) => {
    const commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name });
    await commentPage.addCommentToTaskAndVerify({ taskName, comment });
    await page.getByTestId('navbar-todos-page-link').click();
    const commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    const beforeCount = parseInt(commentCount);
    const afterCount = parseInt(commentCountAfterAddingTask);
    expect(afterCount).toBe(beforeCount + 1);
  });

  test("should increase comment count for the creator when added by the assignee", async ({page, loginPage, taskPage, commentPage})=>{
    const commentCount = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    await loginPage.logoutAndLoginAsDifferentUser({ email: assignee.email, password: assignee.password, username: assignee.name });
    await commentPage.addCommentThenLogoutAndLoginAsDifferentUser({ taskName, comment, email: creator.email, password: creator.password, username: creator.name});
    const commentCountAfterAddingTask = await page.getByRole('row', { name: new RegExp(taskName,"i")}).getByRole('cell').nth(3).innerText();
    const beforeCount = parseInt(commentCount);
    const afterCount = parseInt(commentCountAfterAddingTask);
    expect(afterCount).toBe(beforeCount + 1);
  });
});
