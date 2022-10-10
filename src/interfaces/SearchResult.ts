import Post from "./Post";
import PostWithBlogger from "./PostWithBlogger";

export default interface SearchResult extends PostWithBlogger {
    search_rank: number
    author: string
    upvoted_on: string
}