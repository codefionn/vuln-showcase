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
import { redirect } from "../utils/control.ts";
import { MiddleAuthentication } from "./_middleware.ts";
import { InsertPost, Post } from "../entity/Post.ts";
import PostRepository from "../repository/PostRepository.ts";
import { assert } from "https://deno.land/std@0.150.0/_util/assert.ts";

interface Props {
  userId: number;
  error?: string;
  success?: string;
  title?: string;
  content?: string;
  isPrivate?: boolean;
}

async function handle(
  userId: number | undefined,
): Promise<{ resp?: Response; userId?: number }> {
  if (!userId) {
    return { resp: redirect("/user/login?warning=0") };
  }

  return { userId: userId };
}

export const handler: Handlers<Props, MiddleAuthentication> = {
  async GET(req, ctx) {
    const { resp, userId } = await handle(ctx.state.id);
    if (resp) {
      return resp;
    }

    assert(userId);

    return ctx.render({
      userId: userId,
    });
  },
  async POST(req, ctx) {
    const { resp, userId } = await handle(ctx.state.id);
    if (resp) {
      return resp;
    }

    assert(userId);

    const form = await req.formData();
    const titleForm = form.get("title");
    const contentForm = form.get("content");
    const isPrivateForm = form.get("is_private");

    const title = !titleForm ? "" : titleForm.toString();
    const content = !contentForm ? "" : contentForm.toString();

    const post: InsertPost = {
      userId: userId,
      title: title,
      content: content,
      isPrivate: !!isPrivateForm,
    };

    if (post.title.trim() === "" || post.content.trim() === "") {
      return ctx.render({
        userId: userId,
        title: title,
        content: content,
        isPrivate: !!isPrivateForm,
        error: "Title or content of the post cannot be empty",
      });
    }

    const newPost = await (await import("../repository/db.ts")).connectDb(
      async (dbClient) => {
        const postRepo = new PostRepository(dbClient);
        return await postRepo.insert(post);
      },
    );

    if (!newPost) {
      return ctx.render({
        userId: userId,
        title: title,
        content: content,
        isPrivate: !!isPrivateForm,
        error: "Technical error occured",
      });
    }

    return redirect("/user/post/" + newPost.id);
  },
};

export default function EditPost({ data, params }: PageProps<Props>) {
  const title = data.title;
  const content = data.content;
  const isPrivate = data.isPrivate;
  return (
    <MainPage title={"Post"} userId={data.userId} cssFiles={["user/post"]}>
      <h1>Create post</h1>
      {data.success && <div class="success">{data.success}</div>}
      {data.error && <div class="error">{data.error}</div>}
      <form method="post" action={"/create_post"}>
        <input id="title" name="title" value={title ?? ""} />
        <textarea id="content" name="content" cols={80} rows={20}>
          {content ?? ""}
        </textarea>
        <div>
          <input
            id="is_private"
            name="is_private"
            type="checkbox"
            checked={isPrivate ?? true}
          />
          <label for="is_private">Is Private</label>
        </div>
        <button type="submit" title="Create post">Create post</button>
      </form>
    </MainPage>
  );
}
