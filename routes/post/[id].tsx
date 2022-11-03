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
import MainPage from "../../components/MainPage.tsx";
import { redirect } from "../../utils/control.ts";
import { MiddleAuthentication } from "../_middleware.ts";
import { Post } from "../../entity/Post.ts";
import PostRepository from "../../repository/PostRepository.ts";

interface Props {
  userId?: number;
  post: Post;
}

async function handle(
  userId: number | undefined,
  postIdStr: string,
): Promise<{ resp?: Response; userId?: number; post?: Post }> {
  const postId = parseInt(postIdStr, 10);
  if (isNaN(postId)) {
    return { resp: redirect("/") };
  }

  const post = await (await import("../../repository/db.ts")).connectDb(
    async (dbClient) => {
      const postRepo = new PostRepository(dbClient);
      return await postRepo.findById(postId);
    },
  );

  if (!post) {
    return { resp: redirect("/user/account") };
  }

  // Insecure: No check if the user own the post

  return { userId: userId, post: post };
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    const { resp, userId, post } = await handle(ctx.state.id, ctx.params.id);
    if (resp) {
      return resp;
    }

    if (!post) { // Yeah, that should not happen
      return redirect("/");
    }

    return ctx.render({
      userId: userId,
      post: post,
    });
  },
};

export default function EditPost({ data, params }: PageProps<Props>) {
  const post = data.post;
  return (
    <MainPage title={"Post"} userId={data.userId} cssFiles={["post"]}>
      <h1>Post: {post.title}</h1>
      <div class="post">
        <div
          class="post-description"
          dangerouslySetInnerHTML={{ __html: post.content }} // Yeah, that's dangerous
        >
        </div>
      </div>
    </MainPage>
  );
}
