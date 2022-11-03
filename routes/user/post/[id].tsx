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
import MainPage from "../../../components/MainPage.tsx";
import { redirect } from "../../../utils/control.ts";
import { MiddleAuthentication } from "../../_middleware.ts";
import { Post } from "../../../entity/Post.ts";
import PostRepository from "../../../repository/PostRepository.ts";

interface Props {
  userId: number;
  post: Post;
  error?: string;
  success?: string;
}

async function handle(
  userId: number | undefined,
  postIdStr: string,
): Promise<{ resp?: Response; userId?: number; post?: Post }> {
  if (!userId) {
    return { resp: redirect("/") };
  }

  const postId = parseInt(postIdStr, 10);
  if (isNaN(postId)) {
    return { resp: redirect("/user/account") };
  }

  const post = await (await import("../../../repository/db.ts")).connectDb(
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

    if (!userId || !post) { // Yeah, that should not happen
      return redirect("/");
    }

    return ctx.render({
      userId: userId,
      post: post,
    });
  },
  async POST(req, ctx) {
    const { resp, userId, post } = await handle(ctx.state.id, ctx.params.id);
    if (resp) {
      return resp;
    }

    if (!userId || !post) { // Yeah, that should not happen
      return redirect("/");
    }

    const form = await req.formData();
    const titleForm = form.get("title");
    const contentForm = form.get("content");
    const isPrivateFormat = form.get("is_private");
    if (!titleForm || !contentForm) {
      return redirect("/user/account");
    }

    const title = titleForm.toString();
    const content = contentForm.toString();

    const oldPost: Post = JSON.parse(JSON.stringify(post));
    post.title = title;
    post.content = content;
    post.isPrivate = !!isPrivateFormat;

    if (post.title.trim() === "" || post.content.trim() === "") {
      return ctx.render({
        userId: userId,
        post: post,
        error: "Title or content of the post cannot be empty",
      });
    }

    const updated = await (await import("../../../repository/db.ts")).connectDb(
      async (dbClient) => {
        const postRepo = new PostRepository(dbClient);
        return await postRepo.update(oldPost, post);
      },
    );

    return ctx.render({
      userId: userId,
      post: post,
      success: updated ? "Changes saved successfully" : "No changes made",
    });
  },
};

export default function EditPost({ data, params }: PageProps<Props>) {
  const post = data.post;
  return (
    <MainPage title={"Post"} userId={data.userId} cssFiles={["user/post"]}>
      <h1>Edit post</h1>
      {data.success && <div class="success">{data.success}</div>}
      {data.error && <div class="error">{data.error}</div>}
      <form method="post" action={"/user/post/" + post.id}>
        <input id="title" name="title" value={post.title} />
        <textarea id="content" name="content" cols={80} rows={20}>
          {post.content}
        </textarea>
        <div>
          <input
            id="is_private"
            name="is_private"
            type="checkbox"
            checked={post.isPrivate}
          />
          <label for="is_private">Is Private</label>
        </div>
        <button type="submit">Save</button>
      </form>
    </MainPage>
  );
}
