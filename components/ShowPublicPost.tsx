import { Post } from "../entity/Post.ts";

interface ShowPublicPostProps {
  post: Post;
}

export default function ShowPublicPost({ post }: ShowPublicPostProps) {
  return (
    <div class="post public-post">
      <div class="post-title">{post.title}</div>
      <div
        class="post-short-description"
        dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) }} // Yeah, it's dangerous
      >
      </div>
    </div>
  );
}
