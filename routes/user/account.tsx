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

import MainPage from "../../components/MainPage.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { MiddleAuthentication } from "../_middleware.ts";
import { PoolClient } from "pg";
import UserRepository from "../../repository/UserRepository.ts";
import PostRepository from "../../repository/PostRepository.ts";
import { redirect } from "../../utils/control.ts";
import { User } from "../../entity/User.ts";
import { Post } from "../../entity/Post.ts";
import ShowPrivatePost from "../../components/ShowPrivatePost.tsx";

interface Props {
  user: User;
  posts: Post[];
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    const userId = ctx.state.id;
    if (!userId) {
      return redirect("/user/login");
    }

    const user = await (await import("../../repository/db.ts")).connectDb(
      async (dbClient: PoolClient) => {
        const userRepo = new UserRepository(dbClient);
        return await userRepo.findById(userId);
      },
    );

    if (!user) {
      return redirect("/user/login");
    }

    const posts = await (await import("../../repository/db.ts")).connectDb(
      async (dbClient: PoolClient) => {
        const postsRepo = new PostRepository(dbClient);
        return await postsRepo.findPostsByUserId(user.id);
      },
    );

    return ctx.render({ user: user, posts: posts });
  },
};

function Posts({ posts }: { posts: Post[] }) {
  return (
    <div class="posts">
      {posts.map((post) => (
        <a href={"/user/post/" + post.id}>
          <ShowPrivatePost post={post} />
        </a>
      ))}
    </div>
  );
}

export default function Account({ data }: PageProps<Props>) {
  const user = data.user;
  const posts = data.posts;
  return (
    <MainPage
      title="Account details"
      userId={user.id}
      cssFiles={["user/account", "posts"]}
    >
      <h1>Account</h1>
      <div class="account">
        <div id="email">
          <label>E-Mail</label>
          <div>{user.email}</div>
        </div>
        <div id="name">
          <label>Name</label>
          <div>{user.name}</div>
        </div>
        <div id="surname">
          <label>Surname</label>
          <div>{user.surname}</div>
        </div>
      </div>
      <h2>Posts</h2>
      <div class="create-post" style={{ float: "right" }}>
        <a href="/create_post">
          <button title="Create a post">Create a post</button>
        </a>
      </div>
      <Posts posts={posts} />
    </MainPage>
  );
}
