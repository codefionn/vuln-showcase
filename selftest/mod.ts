import { User } from "../entity/User.ts";
import UserRepository from "../repository/UserRepository.ts";

function test(condition: boolean, errorMessage: string): void {
  if (!condition) {
    console.error("Test failed: " + errorMessage);
  }
}

export async function doSelfTests(): Promise<void> {
  console.log("-- Running selftest -- ");

  await Promise.all([
    doRepositoryTests(),
  ]);

  console.log("-- Finished running selftest --");
}

async function doRepositoryTests(): Promise<void> {
  console.log("-- Testing repositories --");

  await (await import("../repository/db.ts")).connectDb(async (client) => {
    const userRepo = new UserRepository(client);
    const user1 = await userRepo.findById(1);
    if (typeof user1 !== "undefined") {
      test(user1.id === 1, "User1 must have id 1");
      test(
        await user1.verifyPassword("test"),
        'User1 must have password "test"',
      );
      test(
        !(await user1.verifyPassword("nottest")),
        'User1 must not have password "nottest"',
      );
    } else {
      test(false, "User with id 1 must exist in database");
    }

    const user2 = await userRepo.findById(2);
    if (typeof user2 !== "undefined") {
      test(user2.id === 2, "User2 must have id 2");
      test(
        await user2.verifyPassword("test"),
        'User2 must have password "test"',
      );
    } else {
      test(false, "User with id 2 must exist in database");
    }
  });
}
