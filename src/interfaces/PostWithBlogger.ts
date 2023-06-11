import { supabase } from "@utils/supabaseClient";
import { Database } from "./supabase";
import { SUPABASE_POST_TABLE } from "@utils/constants";





type PostWithBlogger = Partial<Database["public"]["Tables"]["posts"]["Row"]> & {
    bloggers?: Pick<Database["public"]["Tables"]["bloggers"]["Row"], "name" | "id">[] | Pick<Database["public"]["Tables"]["bloggers"]["Row"], "name" | "id"> | null
    upvoter?: any
    posts?: any
};


// type PostWithBlogger = typeof supabase.from(SUPABASE_POST_TABLE).select("*, bloggers(id,name")

// type UpvoteWithPost = 

export default PostWithBlogger

