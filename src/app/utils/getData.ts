import 'server-only';
import { LIMIT, SUPABASE_BLOGGER_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE } from "@utils/constants";
import { cache } from "react";
import { getHtmlFromMarkdown } from '@utils/getResources';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@utils/supabaseClient';

export const getUser = cache(async (id: string) => {

    const { data: userData } = await supabase
        .from(SUPABASE_BLOGGER_TABLE)
        .select("id,name,avatar_url,about,twitter,github,web")
        .eq("id", id)
        .single();

    return userData
})


export const getUserLatestPosts = async (id: string) => {

    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .eq("created_by", id)
        .eq("published", true)
        .order("published_on", { ascending: false })
        .limit(LIMIT);

    return data
}

export const getUserPrivatePosts = cache(async (userId: string, supabase: SupabaseClient) => {
    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .match({ created_by: userId, published: false })
        .order("created_at", { ascending: false })
        .limit(LIMIT);
    return data;
})

export const getUpvotes = cache(async (idArray: number[]) => {

    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select("id,upvote_count")
        .in("id", idArray);
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
    const imagesToUrls: Record<string, string> = {}
    const { data } = await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).list(post.image_folder)
    if (data) {
        for (let file of data) {

            if (/$canvas-(\d+)$/.test(file.name)) continue
            const { publicUrl } = supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).getPublicUrl(post.image_folder + "/" + file.name).data

            imagesToUrls[file.name] = publicUrl
        }
    }

    const content = (await getHtmlFromMarkdown(fileData)).content;

    const markdown = await fileData.text()

    return { post, content, imagesToUrls, markdown }
})