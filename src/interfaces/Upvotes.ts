import PostWithBlogger from "./PostWithBlogger"
import { Database } from "./supabase"

type UpvoteWithPost = Database["public"]["Tables"]["upvotes"]["Row"] & {
    posts: PostWithBlogger[] | PostWithBlogger
}


export default UpvoteWithPost