import { Post } from "../entity/Post.ts";

interface ShowPrivatePostProps {
  post: Post;
}

export default function ShowPrivatePost({ post }: ShowPrivatePostProps) {
  return (
    <div class="post public-post">
      <div class="post-title">{post.title}</div>
      {post.isPrivate && <div class="post-is-private">Private</div>}
      <div
        class="post-short-description"
        dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) }} // Yeah, it's dangerous
      >
      </div>
    </div>
  );
}
