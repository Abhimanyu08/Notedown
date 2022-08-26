import Post from "./Post";

export default interface PostWithBlogger extends Post {
    bloggers: { name: string }
}