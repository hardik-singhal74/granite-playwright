import {test} from '../fixtures';

test.describe("Login Page",()=>{
  test("should login with correct credentials", async ({page, loginPage})=>{

    await page.goto("http://localhost:3000/login");
    await loginPage.loginAndVerifyUser({email: "oliver@example.com", password: "welcome", username: "Oliver"});
  });
});
