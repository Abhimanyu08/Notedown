import 'server-only';
import { LIMIT, SUPABASE_BLOGGER_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import { cache } from "react";
import { getHtmlFromMarkdown } from '@utils/getResources';
import { SupabaseClient } from '@supabase/supabase-js';

export const getUser = cache(async (id: string) => {

    const { data: userData } = await supabase
        .from(SUPABASE_BLOGGER_TABLE)
        .select("id,name,avatar_url,about,twitter,github,web")
        .eq("id", id)
        .single();

    return userData
})


export const getUserLatestPosts = cache(async (id: string) => {

    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .eq("created_by", id)
        .order("published_on", { ascending: false })
        .limit(LIMIT);

    return data
})


export const getPost = cache(async (postId: string, supabaseClient: SupabaseClient) => {
    const { data: post, error } = await supabaseClient
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,created_by,title,description,language,published_on,published,filename,image_folder, bloggers(id,name)"
        )
        .match({ id: postId })
        .single();

    if (error || !post) {
        throw new Error(error.message || "post not found")
    }

    const filename = post.filename;

    if (!filename) {

        throw new Error("post not found")
    };
    const { data: fileData, error: fileError } = await supabaseClient.storage
        .from(SUPABASE_FILES_BUCKET)
        .download(filename);

    if (!fileData || fileError) {
        throw new Error(fileError.message || "couldn't load file data")
    }

    const content = (await getHtmlFromMarkdown(fileData)).content;


    return { post, content }
})