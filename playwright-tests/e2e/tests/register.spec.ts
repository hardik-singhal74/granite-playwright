import {test} from '../fixtures';
import { faker } from "@faker-js/faker";

test.describe("Register Page", ()=>{
  test("should register a new user.", async ({page, loginPage})=>{
    const newUserName = faker.person.fullName();
    const newUserEmail = faker.internet.email();
    const newUserPassword = faker.internet.password();
    await loginPage.registerUser({email: newUserEmail, password: newUserPassword, username: newUserName});
    await loginPage.loginAndVerifyUser({email : newUserEmail, password: newUserPassword, username: newUserName});
  });
});
