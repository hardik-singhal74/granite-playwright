import {STORAGE_STATE} from "../../playwright.config";
import {test} from '../fixtures';
import LoginPage from "../poms/login";

test.describe("Login Page",()=>{
  test("should login with correct credentials", async ({page, loginPage})=>{
    await test.step("Step: Logining in and setting up local storage", async () => {
      await page.goto("/");
      await loginPage.loginAndVerifyUser({email: "oliver@example.com", password: "welcome", username: "Oliver"});
      await page.context().storageState({ path: STORAGE_STATE });
    })
  });
});
