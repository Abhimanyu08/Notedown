import { Database } from "./supabase";


type PostWithBlogger = Partial<Database["public"]["Tables"]["posts"]["Row"]> & {
    bloggers?: Pick<Database["public"]["Tables"]["bloggers"]["Row"], "name" | "id">[] | Pick<Database["public"]["Tables"]["bloggers"]["Row"], "name" | "id"> | null
};

export default PostWithBlogger

