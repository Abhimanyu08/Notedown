import Blogger from "./Blogger";
import Post from "./Post";

export default interface PostWithBlogger extends Post {
    bloggers: Partial<Blogger>
}