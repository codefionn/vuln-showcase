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
import UserRepository from "../../repository/UserRepository.ts";
import { PoolClient } from "pg";
import MainPage from "../../components/MainPage.tsx";
import { redirect } from "../../utils/control.ts";
import { createJwt } from "../../utils/jwt.ts";

interface Props {
  error?: string;
  warning?: string;
  login?: string;
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    if (ctx.state.id) {
      return redirect("/user/account");
    }

    const url = new URL(req.url);
    const warningId = url.searchParams.get("warning");
    let warning = undefined;
    if (warningId) {
      switch (parseInt(warningId)) {
        case 0:
          warning = "Login to create a post";
          break;
      }
    }

    ctx.state.id = undefined;

    return ctx.render({
      warning: warning,
    });
  },
  async POST(req, ctx) {
    if (ctx.state.id) {
      return redirect("/user/account");
    }

    const form = await req.formData();
    const login = form.get("login");
    const password = form.get("password");
    if (!login || !password) {
      return ctx.render({
        error: "A technical error occured",
      });
    }

    const user = await (await import("../../repository/db.ts")).connectDb(
      async (dbClient: PoolClient) => {
        const userRepo = new UserRepository(dbClient);
        return await userRepo.findByEmail(login.toString());
      },
    );

    if (!user || !(await user.verifyPassword(password.toString()))) {
      return ctx.render({
        error: "Login or password are incorrect",
        login: login.toString(),
      });
    }

    // Login successfull
    ctx.state.id = user.id;

    return redirect("/user/account");
  },
};

export default function Login({ data }: PageProps<Props>) {
  return (
    <MainPage title="Login" cssFiles={["user/login"]}>
      {data.error && <div class="error">{data.error}</div>}
      {data.warning && <div class="warning">{data.warning}</div>}
      <form method="post" action="/user/login">
        <label for="login">E-Mail</label>
        <input
          id="login"
          name="login"
          placeholder="user@example.org"
          value={data.login ?? ""}
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
        <button type="submit">Login</button>
        <div id="register">
          <a href="/user/register">No account? Register.</a>
        </div>
      </form>
    </MainPage>
  );
}
