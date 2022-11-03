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

import { Handlers } from "$fresh/server.ts";
import { MiddleAuthentication } from "../_middleware.ts";
import { redirect } from "../../utils/control.ts";
import MainPage from "../../components/MainPage.tsx";

export const handler: Handlers<null, MiddleAuthentication> = {
  async GET(req, ctx) {
    if (!ctx.state.id) {
      return redirect("/");
    }

    ctx.state.id = undefined;

    return ctx.render();
  },
};

export default function Logout() {
  return (
    <MainPage title="Logged out">
      Logged out
    </MainPage>
  );
}
