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
import { User } from "../../entity/User.ts";

interface Props {
  key?: string;
  userId?: number;
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const key = url.searchParams.get("key") ?? "";

    return await (await import("../../repository/db.ts")).connectDb(
      async (dbClient) => {
        const confirmRepo = new ConfirmRepository(dbClient);
        const confirm = await confirmRepo.findBySubjectNameAndKey("user", key);
        if (!confirm) {
          return ctx.render({
            userId: ctx.state.id,
            key: key,
          });
        }

        const userRepo = new UserRepository(dbClient);
        const user = await userRepo.findById(confirm.subjectId);
        if (!user) { // User doesn't exist => delete confirmation and display error
          await confirmRepo.deleteById(confirm.id);
          return ctx.render({
            userId: ctx.state.id,
            key: key,
          });
        }

        // Make user active
        const oldUser: User = JSON.parse(JSON.stringify(user)); // clone
        user.isActive = true;
        await userRepo.update(oldUser, user);

        // Delete confirmation
        await confirmRepo.deleteById(confirm.id);

        // Login
        ctx.state.id = user.id;

        return redirect("/user/account");
      },
    );
  },
};

export default function ConfirmRegister({ data }: PageProps<Props>) {
  return (
    <MainPage title="Registered" userId={data.userId}>
      <p class="error">
        The confirmation key <b>{data.key}</b>{" "}
        does not exist or was already used. Please register a new account.
      </p>
    </MainPage>
  );
}
