import { PostTypes } from "@/interfaces/PostTypes";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { SUPABASE_POST_TABLE, LIMIT } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";

const fetchPrivatePosts: (
    lastPost: PostWithBlogger,
    cursorKey: keyof PostWithBlogger

) => Promise<PostWithBlogger[] | undefined> = async (lastPost, cursorKey) => {
    const cursor = lastPost[cursorKey]
    const { data, error } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .match({ created_by: lastPost["created_by"], published: false })
        .lt("created_at", cursor)
        .order("created_at", { ascending: false })
        .limit(LIMIT);

    if (error || !data) {
        alert("Failed to return more data");
        return;
    }

    return data;
};



const postTypeToFetcher: { [k in PostTypes]?: (
    lastPost: PostWithBlogger,
    cursorKey: keyof PostWithBlogger

) => Promise<PostWithBlogger[] | undefined> } = {
    private: fetchPrivatePosts
}

export default postTypeToFetcher