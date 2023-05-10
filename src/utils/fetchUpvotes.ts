import { Dispatch, SetStateAction } from "react";
import Post from "../src/interfaces/Post";
import PostWithBlogger from "../src/interfaces/PostWithBlogger";
import { SUPABASE_POST_TABLE } from "./constants";
import { supabase } from "./supabaseClient";

export async function fetchUpvotes(postArray: Partial<PostWithBlogger>[] | null | undefined,
    setPostFunc: Dispatch<
        SetStateAction<Partial<PostWithBlogger>[]>
    >) {
    const idArray = postArray?.map((post) => post.id!);
    if (idArray) {
        const { data } = await supabase
            .from<Post>(SUPABASE_POST_TABLE)
            .select("id,upvote_count")
            .in("id", idArray);
        if (data) {
            let idToUpvotes: Record<number, number> = {};
            data.forEach((post) => {
                idToUpvotes[post.id] = post.upvote_count;
            });
            setPostFunc((prev) => prev?.map((post) => ({
                ...post,
                upvote_count: idToUpvotes[post.id!],
            }))
            );
        }
    }
}