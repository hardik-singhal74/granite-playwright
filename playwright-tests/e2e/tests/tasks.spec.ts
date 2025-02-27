import { test } from "../fixtures"
import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

test.describe("Tasks Page", ()=>{
  let taskName : string;
  test.beforeEach(async ({page})=>{
    taskName = faker.word.words({count: 5});
    await page.goto("/");
  });
  test("should create a new task with creator as the assignee", async ({page, taskPage}) =>{
    await taskPage.createTaskAndVerify({taskName});
  });
  test("should be able to mark a test as completed", async ({page, loginPage, taskPage}) => {
    await taskPage.createTaskAndVerify({taskName});
    await page.getByTestId('tasks-pending-table').getByRole("row",{name: taskName}).getByRole("checkbox").click();
    const completedTaskInDashboard = page.getByTestId('tasks-completed-table').getByRole("row",{name: taskName});
    await completedTaskInDashboard.scrollIntoViewIfNeeded();
    await expect(completedTaskInDashboard).toBeVisible();
  });
});
