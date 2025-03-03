import {Page, test, expect} from '@playwright/test';
import {
  CREATE_TASK_SELECTORS,
  NAVBAR_SELECTORS,
  TASKS_TABLE_SELECTORS,
} from "../constants/selectors";
import { COMMON_TEXTS, DASHBOARD_TEXTS } from "../constants/texts";

interface TaskName {
  taskName: string;
}
interface CreateNewTaskProps extends TaskName {
  userName ?: string;
}

export class TaskPage {

  constructor(private page: Page) {}

  createTaskAndVerify = async ({taskName, userName = COMMON_TEXTS.defaultUserName}:CreateNewTaskProps) => {
    await test.step("Step 1: Adding task with creator name and assignee name:", async () => {
      await this.page.getByTestId(NAVBAR_SELECTORS.addTodoButton).click();
    await this.page
      .getByTestId(CREATE_TASK_SELECTORS.taskTitleField)
      .fill(taskName);

    await this.page
      .locator(CREATE_TASK_SELECTORS.memberSelectContainer)
      .click();
    await this.page
      .locator(CREATE_TASK_SELECTORS.memberOptionField)
      .getByText(userName)
      .click();
    await this.page.getByTestId(CREATE_TASK_SELECTORS.createTaskButton).click();
    });
    await test.step("Step 2: Verifying addition of task to pending tasks table", async () => {
      const taskInDashboard = this.page
      .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
      .getByRole("row", {
        name: new RegExp(taskName, "i"),
      });
      await taskInDashboard.scrollIntoViewIfNeeded();
      await expect(taskInDashboard).toBeVisible();
    });
  };
  markTaskAsCompletedAndVerify = async ({taskName}:TaskName) => {
    await test.step("Step 1: Checking if page is properly loaded", async () => {
      await expect(this.page.getByRole("heading",{name : DASHBOARD_TEXTS.loading})).toBeHidden();
    });

    const completedTaskInDashboard = this.page
      .getByTestId(TASKS_TABLE_SELECTORS.completedTasksTable)
      .getByRole("row", { name: taskName });
    const isTaskCompleted = await completedTaskInDashboard.count();

    if(isTaskCompleted) return;

    await test.step("Step 2: Checking if changes are reflected on the page", async () => {
      await this.page
      .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
      .getByRole("row", { name: taskName })
      .getByRole("checkbox")
      .click();
      await completedTaskInDashboard.scrollIntoViewIfNeeded();
      await expect(completedTaskInDashboard).toBeVisible();
    });
  };
  starTaskAndVerify = async ({taskName}: {taskName: string}) => {
    const starIcon = this.page
      .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
      .getByRole("row", { name: taskName })
      .getByTestId(TASKS_TABLE_SELECTORS.starUnstarButton);
    await test.step("Step 1: Clicking the star icon", async () => {
      await starIcon.click();
    });
    await test.step("Step 2: Checking if changes are reflected on the pending task table", async () => {
      await expect(starIcon).toHaveClass(DASHBOARD_TEXTS.starredTaskClass);
      await expect(
        this.page
          .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
          .getByRole("row")
          .nth(1) // Using nth methods here since we want to verify the first row of the table
      ).toContainText(taskName);
    });
  };
}
