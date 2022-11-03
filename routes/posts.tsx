import MainPage from "../components/MainPage.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Post } from "../entity/Post.ts";
import { connectDb } from "../repository/db.ts";
import PostRepository from "../repository/PostRepository.ts";
import ShowPublicPost from "../components/ShowPublicPost.tsx";
import { MiddleAuthentication } from "./_middleware.ts";

export const handler: Handlers<PostsProps, MiddleAuthentication> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "q";

    const posts: Post[] = await (await connectDb(async (dbClient) => {
      const postRepo = new PostRepository(dbClient);

      return await postRepo.findPublicPostsByTitleOrContentInsecure(q);
    }));

    return ctx.render({
      searchTerm: q,
      posts: posts,
      userId: ctx.state.id,
    });
  },
};

function ShowTechnicalError() {
  return (
    <div class="error">
      An error occured!
    </div>
  );
}

function ShowNoPosts() {
  return (
    <div class="error">
      No posts found!
    </div>
  );
}

interface ShowPostsProps {
  posts: Post[];
}

function ShowPosts(props: ShowPostsProps) {
  return (
    <div class="posts">
      {props.posts.map((post) => <ShowPublicPost post={post} />)}
    </div>
  );
}

interface PostsProps {
  searchTerm: string;
  posts?: Post[];
  userId?: number;
}

export default function Posts({ data }: PageProps<PostsProps>) {
  return (
    <MainPage
      title="Search"
      description="Search for public posts"
      userId={data.userId}
      cssFiles={["posts"]}
    >
      <form method="get" action="/posts">
        <h1>Search</h1>
        <input id="search" name="q" value={data.searchTerm} required />
      </form>
      {!data.posts && <ShowTechnicalError />}
      {data.posts && data.posts.length === 0 && <ShowNoPosts />}
      {data.posts && data.posts.length > 0 && <ShowPosts posts={data.posts} />}
    </MainPage>
  );
}
