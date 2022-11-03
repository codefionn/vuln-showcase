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
import MainPage from "../components/MainPage.tsx";
import MaterialDesignIcon from "../components/MaterialDesignIcon.tsx";
import { MiddleAuthentication } from "./_middleware.ts";

interface Props {
  userId?: number;
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    return ctx.render({
      userId: ctx.state.id,
    });
  },
};

export default function Home({ data }: PageProps<Props>) {
  return (
    <MainPage
      title="Home"
      description="Home of vuln-showcase"
      cssFiles={["index"]}
      userId={data.userId}
    >
      <div class="flex-grow"></div>
      <form method="get" action="/posts">
        <h1>vuln-showcase</h1>
        <div class="search">
          <input id="search-input" name="q" required />
          <span class="search-icon">
            <button type="submit" title="Submit">
              <MaterialDesignIcon fileName="search" alt="Search" />
            </button>
          </span>
        </div>
      </form>
      {data.userId &&
        (
          <div class="create-post">
            <a href="/create_post">
              <button title="Create a post">Create a post</button>
            </a>
          </div>
        )}
      {!data.userId &&
        (
          <div class="create-post">
            <a href="/user/login?warning=0">
              <button title="Create a post">Create a post</button>
            </a>
          </div>
        )}
      <div class="flex-grow"></div>
    </MainPage>
  );
}
