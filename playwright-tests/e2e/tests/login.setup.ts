import {STORAGE_STATE} from "../../playwright.config";
import {test} from '../fixtures';
import LoginPage from "../poms/login";
import { COMMON_TEXTS } from "../constants/texts";

test.describe("Login Page",()=>{
  test("should login with correct credentials", async ({page, loginPage})=>{
    await test.step("Step 1: Visit login page", () => page.goto("/"));
    await test.step("Step 2: Login and verify admin user", () => loginPage.loginAndVerifyUser({email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD!, username: COMMON_TEXTS.defaultUserName}));
    await page.context().storageState({ path: STORAGE_STATE });
  });
});
