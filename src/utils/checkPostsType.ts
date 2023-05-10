import Post from "../src/interfaces/Post";
import PostWithBlogger from "../src/interfaces/PostWithBlogger";

export function checkPostsType(
	posts: PostWithBlogger[] | Post[]
): posts is PostWithBlogger[] {
	return Object.hasOwn(posts.at(0) || {}, "bloggers");
}
