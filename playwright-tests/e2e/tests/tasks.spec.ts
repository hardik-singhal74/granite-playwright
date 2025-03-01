import { test } from "../fixtures";
import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";
import { TaskPage } from "../poms/tasks";
import LoginPage from "../poms/login";

test.describe("Tasks Page", () => {

  let taskName: string;

  test.beforeEach(async ({ page, taskPage }, testInfo) => {
    taskName = faker.word.words({ count: 5 });

    if (testInfo.title.includes("[SKIP_SETUP]")) return;
    await test.step("Step 1: Creating a new task", async () => {
      await page.goto("/");
      await taskPage.createTaskAndVerify({taskName});
    });
  });

  test.afterEach(async ({ page , taskPage }) => {
    await test.step("Step 1: Mark task as completed", async () => {
      await page.goto("/");
      await taskPage.markTaskAsCompletedAndVerify({taskName});
    });
    const completedTaskInDashboard = await page
      .getByTestId("tasks-completed-table")
      .getByRole("row", { name: new RegExp(taskName, "i") });
    await test.step("Step 2: Deleting completed task", async () => {
      await completedTaskInDashboard
        .getByTestId("completed-task-delete-link")
        .click();
      await expect(completedTaskInDashboard).toBeHidden();
      await expect(
        page
         .getByTestId("tasks-pending-table")
          .getByRole("row", { name: new RegExp(taskName, "i") })
      ).toBeHidden();
    });
  });

  test("should be able to mark a task as completed", async ({
    page,
    taskPage,
  }) => {
    await taskPage.markTaskAsCompletedAndVerify({ taskName });
  });

  test.describe("Starring task feature", () => {
    test.describe.configure({ mode: "serial" });
    test("should be able to star a task", async ({ page, taskPage }) => {
      await taskPage.starTaskAndVerify({ taskName });
    });
    test("should be able to un-star a task", async ({ page, taskPage }) => {
      await test.step("Step 1: Starring a task", async () => {
        await taskPage.starTaskAndVerify({ taskName });
      });
      const starIcon = page
        .getByTestId("tasks-pending-table")
        .getByRole("row", { name: new RegExp(taskName, "i") })
        .getByTestId("pending-task-star-or-unstar-link");
      await test.step("Step 2: Unstarring a task", async () => {
        await starIcon.click();
        await expect(starIcon).toHaveClass(/ri-star-fill/);
      });
    });
  });
  test("should add a new task with a different user as the assignee [SKIP_SETUP]", async ({page, browser, taskPage})=>{
    await test.step("Step 1: Creating a task", async () => {
      await page.goto("/");
      await taskPage.createTaskAndVerify({taskName, userName: "Sam Smith"});
    });

    const newUserContext = await browser.newContext({
      storageState: {cookies:[],origin:[]},
    });
    const newUserPage = await newUserContext.newPage();

    const loginPage = new LoginPage(newUserPage);

    await test.step("Step 2: Logining in as assignee and verifying task", async () => {
      await newUserPage.goto("/");
      await loginPage.loginAndVerifyUser({
        email: "sam@example.com",
        password: "welcome",
        username: "Sam Smith",
      });
      await expect( newUserPage.getByTestId("tasks-pending-table").getByRole("row",{name: taskName})).toBeVisible();
    });
    await test.step("Step 3: Closing the storage and user page created", async () => {
      await newUserPage.close();
      await newUserContext.close();
    });
  });
});
