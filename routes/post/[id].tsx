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
      <h1>Post: {post.id}</h1>
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
