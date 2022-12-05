import { sendRevalidationRequest } from "./sendRequest";
import { SUPABASE_POST_TABLE, LIMIT } from "./constants"
import Post from "../src/interfaces/Post"
import { supabase } from "./supabaseClient";

async function checkGreatestStillGreatest(
    id: string,
    greatest?: Partial<Post>[] | null
) {
    if (!greatest) return;
    const { data, error } = await supabase
        .from<Post>(SUPABASE_POST_TABLE)
        .select("id")
        .match({ created_by: id, published: true })
        .order("upvote_count", { ascending: false })
        .limit(LIMIT);

    if (error || !data || data.length === 0) return;

    if (data.some((post, idx) => post.id !== greatest[idx].id)) {
        sendRevalidationRequest(`profile/${id}`);
    }
};

export default checkGreatestStillGreatest