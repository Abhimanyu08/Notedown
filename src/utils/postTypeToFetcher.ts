import { PostTypes } from "@/interfaces/PostTypes";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_POST_TABLE, LIMIT, SUPABASE_UPVOTES_TABLE } from "@utils/constants";

type Value<T> = T[keyof T]

const postTypeToFetcher: { [k in "private" | "public" | "all"]?: (
    lastPost: PostWithBlogger,
    cursorKey: keyof PostWithBlogger,
    supabase: SupabaseClient

) => Promise<{ data: PostWithBlogger[], hasMore: boolean } | undefined> } = {}


export function checkDataLength<T>(data: T[]) {

    if (data.length <= LIMIT) {
        return { data, hasMore: false }
    }
    return { data: data.slice(0, -1), hasMore: true }
}

const fetchAllPosts: Value<typeof postTypeToFetcher> = async (lastPost, cursorKey, supabase) => {
    const cursor = lastPost[cursorKey]
    const { data, error } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .match({ created_by: lastPost["created_by"] })
        .lt("created_at", cursor)
        .order("created_at", { ascending: false })
        .limit(LIMIT + 1);

    if (error || !data) {
        alert("Failed to return more data");
        return;
    }


    return checkDataLength(data)
};


const fetchPrivatePosts: Value<typeof postTypeToFetcher> = async (lastPost, cursorKey, supabase) => {
    const cursor = lastPost[cursorKey]
    const { data, error } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .match({ created_by: lastPost["created_by"], published: false })
        .lt("created_at", cursor)
        .order("created_at", { ascending: false })
        .limit(LIMIT + 1);

    if (error || !data) {
        alert("Failed to return more data");
        return;
    }


    return checkDataLength(data)
};

const fetchPublicPosts: Value<typeof postTypeToFetcher> = async (lastPost, cursorKey, supabase) => {
    const cursor = lastPost[cursorKey]
    const { data, error } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(

            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .match({ created_by: lastPost.created_by, published: true })
        .lt("published_on", cursor)
        .order("published_on", { ascending: false })
        .limit(LIMIT);

    if (error || !data) {

        alert("Failed to return more data");
        return
    }
    return checkDataLength(data)
};

const fetchGreatestPosts: Value<typeof postTypeToFetcher> = async (lastPost, cursorKey, supabase) => {
    const cursor = lastPost[cursorKey]
    const { data, error } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(

            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at,upvote_count"
        )
        .match({ created_by: lastPost.created_by, published: true })
        .lt("upvote_count", cursor)
        .order("upvote_count", { ascending: false })
        .limit(LIMIT);

    if (error || !data) {
        alert("Failed to return more data");
        return;
    }
    return checkDataLength(data)
};

// const fetchUpvotedPosts: Value<typeof postTypeToFetcher> = async (lastUpvote, cursorKey, supabase) => {

//     const cursor = lastUpvote[cursorKey]

//     const { data, error } = await supabase
//         .from(SUPABASE_UPVOTES_TABLE)
//         .select(
//             "created_at, post_id,upvoter, posts(id,created_by,title,description,language,published,published_on,upvote_count,bloggers(id, name))"
//         )
//         .match({ upvoter: lastUpvote.upvoter })
//         .lt("created_at", cursor)
//         .order("created_at", { ascending: false })
//         .limit(LIMIT);

//     if (error || !data) {
//         alert("Failed to return more data");
//         return;
//     }
//     return checkDataLength(data)
// }

postTypeToFetcher.private = fetchPrivatePosts
postTypeToFetcher.public = fetchPublicPosts
postTypeToFetcher.all = fetchAllPosts
// postTypeToFetcher.greatest = fetchGreatestPosts
// postTypeToFetcher.upvoted = fetchUpvotedPosts

export default postTypeToFetcher