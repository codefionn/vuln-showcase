/*
 * vuln-showcase - Showcasing some common web vulnerabilities
 * Copyright (C) 2022 Fionn Langhans
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { assert } from "https://deno.land/std@0.160.0/_util/assert.ts";
import { User } from "../entity/User.ts";
import UserRepository from "../repository/UserRepository.ts";
import PostRepository from "../repository/PostRepository.ts";

function test(condition: boolean, errorMessage: string): void {
  if (!condition) {
    throw "Test failed: " + errorMessage;
  }
}

function failed(errorMessage: string): never {
  throw "Test failed: " + errorMessage;
}

export async function doSelfTests(): Promise<void> {
  console.log("-- Running selftest -- ");

  try {
    await Promise.all([
      doRepositoryTests(),
      doUserTest(),
    ]);
  } catch (err) {
    console.error(err);
  }

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

async function doUserTest(): Promise<void> {
  console.log("-- Testing common user functions --");

  await (await import("../repository/db.ts")).connectDbTestTransaction(
    async (dbClient) => {
      const userRepo = new UserRepository(dbClient);
      const user = await userRepo.insert({
        name: "Testname",
        surname: "Testsurname",
        email: "testemail@mailer",
        cleartextPassword: "mytest",
      });

      if (!user) {
        failed("User must be created");
      }

      assert("Testname" === user.name, "Name must be Testname");
      assert("Testsurname" === user.surname, "Surname must be Testsurname");
      assert(
        "testemail@mailer" === user.email,
        "Surname must be testemail@mailer",
      );
      assert(user.verifyPassword("mytest"), "Password must me mytest");

      const postRepo = new PostRepository(dbClient);
      const publicPost = await postRepo.insert({
        userId: user.id,
        title: "Public Post",
        content: "Public Post Content",
        isPrivate: false,
      });

      if (!publicPost) {
        failed("Post must have been created");
      }

      test("Public Post" === publicPost.title, "Title must be Public Post");
      test(
        "Public Post Content" === publicPost.content,
        "Title must be Public Post Content",
      );
      test(!publicPost.isPrivate, "Post must be public");

      const privatePost = await postRepo.insert({
        userId: user.id,
        title: "private Post",
        content: "private Post Content",
        isPrivate: true,
      });

      if (!privatePost) {
        failed("Post must have been created");
      }

      test("private Post" === privatePost.title, "Title must be private Post");
      test(
        "private Post Content" === privatePost.content,
        "Title must be private Post Content",
      );
      test(privatePost.isPrivate, "Post must be private");
    },
  );
}
