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

import { Handlers, PageProps } from "$fresh/server.ts";
import { MiddleAuthentication } from "../_middleware.ts";
import { redirect } from "../../utils/control.ts";
import MainPage from "../../components/MainPage.tsx";
import UserRepository from "../../repository/UserRepository.ts";
import ConfirmRepository from "../../repository/ConfirmRepository.ts";
import { InsertUser } from "../../entity/User.ts";
import { sendMail } from "../../utils/mail.ts";

interface Props {
  error?: string;
  login?: string;
  name?: string;
  surname?: string;
  success?: boolean;
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    if (ctx.state.id) {
      return redirect("/user/account");
    }

    ctx.state.id = undefined;

    return ctx.render({});
  },
  async POST(req, ctx) {
    if (ctx.state.id) {
      return redirect("/user/account");
    }

    const form = await req.formData();
    const emailForm = form.get("email");
    const nameForm = form.get("name");
    const surnameForm = form.get("surname");
    const passwordForm = form.get("password");
    const repeatedPasswordForm = form.get("repeat_password");

    const email = emailForm ? emailForm.toString().trim() : "";
    const name = nameForm ? nameForm.toString().trim() : "";
    const surname = surnameForm ? surnameForm.toString().trim() : "";
    const password = passwordForm ? passwordForm.toString().trim() : "";
    const repeatedPassword = repeatedPasswordForm
      ? repeatedPasswordForm.toString().trim()
      : "";

    const resultPart = {
      login: email.toString(),
      name: name.toString(),
      surname: surname.toString(),
    };

    // Very primitve E-Mail check
    if (
      !/[a-zA-Z0-9.-_]@[a-zA-Z0-9.-_]([a-zA-Z0-9.-_])?/.test(email.toString())
    ) {
      return ctx.render({
        error: "E-Mail is wrong",
        ...resultPart,
      });
    }

    if (
      [email, name, surname, password, repeatedPassword].some((x) => x === "")
    ) {
      return ctx.render({
        error: "All fields have to be filled",
        ...resultPart,
      });
    }

    if (password !== repeatedPassword) {
      return ctx.render({
        error: "The password has to be repeated correctly",
        ...resultPart,
      });
    }

    const insertUser: InsertUser = {
      email: email,
      name: name,
      surname: surname,
      cleartextPassword: password,
    };

    try {
      const [user, confirm] = await (await import("../../repository/db.ts"))
        .connectDb(
          async (dbClient) => {
            const userRepo = new UserRepository(dbClient);
            const confirmRepo = new ConfirmRepository(dbClient);
            const user = await userRepo.insert(insertUser);
            if (!user) {
              return [undefined, undefined];
            }

            const confirm = await confirmRepo.insert({
              subjectName: "user",
              subjectId: user.id,
            });
            if (!confirm) {
              return [undefined, undefined];
            }

            return [user, confirm];
          },
        );

      if (!user || !confirm) {
        return ctx.render({
          success: false,
          ...resultPart,
        });
      }

      const url = new URL(req.url);

      console.info(
        `Created account with ${user.email} and confirmation ${confirm.key}`,
      );

      if (
        !await sendMail(
          email,
          "Register your account",
          "Confirm with " + url.host + "/user/confirm_register?key=" +
            encodeURIComponent(confirm.key),
        )
      ) {
        // Error when sending E-Mail: Delete account again
        await (await import("../../repository/db.ts"))
          .connectDb(
            async (dbClient) => {
              const userRepo = new UserRepository(dbClient);
              const confirmRepo = new ConfirmRepository(dbClient);

              await confirmRepo.deleteById(confirm.id);
              await userRepo.deleteById(user.id);
            },
          );
      }

      return ctx.render({
        success: true,
        ...resultPart,
      });
    } catch (err) {
      // Probably a duplicate user E-Mail
      return ctx.render({
        success: true,
        ...resultPart,
      });
    }
  },
};

function Registered(data: Props) {
  return (
    <MainPage title="Registered">
      <h1>Registered</h1>
      {data.success &&
        (
          <>
            <p>
              Successfully registered as <b>{data.login}</b>!
            </p>
            <p>
              Please check your E-Mails to complete registration.
            </p>
          </>
        )}
      {!data.success &&
        (
          <p className="error">
            Technical error occured!
          </p>
        )}
    </MainPage>
  );
}

export default function Register({ data }: PageProps<Props>) {
  if (typeof data.success !== "undefined") {
    return Registered(data);
  }

  return (
    <MainPage title="Register" cssFiles={["user/login"]}>
      {data.error && <div class="error">{data.error}</div>}
      <form method="post" action="/user/register">
        <label for="email">E-Mail</label>
        <input
          id="email"
          name="email"
          placeholder="user@example.org"
          value={data.login ?? ""}
          required
        />
        <label for="name">Name</label>
        <input
          id="name"
          name="name"
          placeholder="John"
          value={data.name ?? ""}
          required
        />
        <label for="surname">Surname</label>
        <input
          id="surname"
          name="surname"
          placeholder="Doe"
          value={data.surname ?? ""}
          required
        />
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <label for="repeat_password">Repeat Password</label>
        <input
          id="password"
          name="repeat_password"
          type="password"
          placeholder="Repeated Password"
          required
        />
        <button type="submit">Register</button>
        <div id="register">
          <a href="/user/register">No account? Register.</a>
        </div>
      </form>
    </MainPage>
  );
}
