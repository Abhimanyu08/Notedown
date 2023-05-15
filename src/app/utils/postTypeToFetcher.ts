import { PostTypes } from "@/interfaces/PostTypes";
import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { SUPABASE_POST_TABLE, LIMIT, SUPABASE_UPVOTES_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";

type Value<T> = T[keyof T]

const postTypeToFetcher: { [k in PostTypes]?: (
    lastPost: PostWithBlogger,
    cursorKey: keyof PostWithBlogger

) => Promise<PostWithBlogger[] | undefined> } = {}

const fetchPrivatePosts: Value<typeof postTypeToFetcher> = async (lastPost, cursorKey) => {
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

const fetchLatestPosts: Value<typeof postTypeToFetcher> = async (lastPost, cursorKey) => {
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
    return data
};

const fetchGreatestPosts: Value<typeof postTypeToFetcher> = async (lastPost, cursorKey) => {
    const cursor = lastPost[cursorKey]
    console.log(cursor)
    const { data, error } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(

            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at,upvote_count"
        )
        .match({ created_by: lastPost.created_by, published: true })
        .lt("upvote_count", cursor)
        .order("upvote_count", { ascending: false })
        .limit(LIMIT);

    console.log(error, data)
    if (error || !data) {
        alert("Failed to return more data");
        return;
    }
    return data
};

// const fetchUpvotedPosts: Value<typeof postTypeToFetcher> = async (lastPost, cursorKey) => {
//     const cursor = lastPost[cursorKey]
// 			const { data } = await supabase
// 				.from(SUPABASE_UPVOTES_TABLE)
// 				.select("created_at, post_id")
// 				.match({ upvoter:  })
// 				.lt("created_at", cursor)
// 				.order("created_at", { ascending: false })
// 				.limit(LIMIT);
// 			if (data) {
// 				const { data: posts } = await supabase
// 					.from<Post>(SUPABASE_POST_TABLE)
// 					.select(
// 						"id,created_by,title,description,language,published,published_on,upvote_count,bloggers(name)"
// 					)
// 					.in(
// 						"id",
// 						data.map((upvote) => upvote.post_id)
// 					);
// 				if (posts) {
// 					let modifiedData: Record<number, string> = {};
// 					data.forEach(
// 						(upvote) =>
// 							(modifiedData[upvote.post_id] = upvote.created_at)
// 					);
// 					let upvotedPosts = posts
// 						.map((post) => ({
// 							...post,
// 							upvoted_on: modifiedData[post.id],
// 						}))
// 						.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
// 					setUpvotedPosts((prev) => [
// 						...(prev || []),
// 						...upvotedPosts,
// 					]);
// 				}
// 			}
// 			return (data?.length || 0) > 0;
// }
postTypeToFetcher.private = fetchPrivatePosts
postTypeToFetcher.latest = fetchLatestPosts
postTypeToFetcher.greatest = fetchGreatestPosts

export default postTypeToFetcher