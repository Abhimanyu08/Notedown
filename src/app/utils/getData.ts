import 'server-only';
import { LIMIT, SUPABASE_BLOGGER_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE, SUPABASE_UPVOTES_TABLE } from "@utils/constants";
import { cache } from "react";
import { getHtmlFromMarkdownFile } from '@utils/getResources';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@utils/supabaseClient';
import { checkDataLength } from './postTypeToFetcher';

export const getUser = cache(async (id: string) => {

    const { data: userData } = await supabase
        .from(SUPABASE_BLOGGER_TABLE)
        .select("id,name,avatar_url,about")
        .eq("id", id)
        .single();

    return userData
})

export const getUserAllPosts = cache(async (userId: string, supabase: SupabaseClient) => {
    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .match({ created_by: userId })
        .order("created_at", { ascending: false })
        .limit(LIMIT + 1);
    return checkDataLength(data || [])
})

export const getUserPublicPosts = cache(async (id: string) => {

    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .eq("created_by", id)
        .eq("published", true)
        .order("published_on", { ascending: false })
        .limit(LIMIT + 1);

    return checkDataLength(data || [])
})

export const getGreatestPosts = async (id: string) => {

    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at,upvote_count"
        )
        .match({ created_by: id, published: true })
        .order("upvote_count", { ascending: false })
        .limit(LIMIT + 1);

    return checkDataLength(data || [])
}

export const getUpvotedPosts = async (id: string) => {
    const { data } = await supabase
        .from(SUPABASE_UPVOTES_TABLE)
        .select(
            "created_at, post_id, upvoter, posts(id,created_by,title,description,language,published,published_on,upvote_count,bloggers(id, name))"
        )
        .match({ upvoter: id })
        .order("created_at", { ascending: false })
        .limit(LIMIT + 1);


    return checkDataLength(data || [])
}

export const getUserPrivatePosts = cache(async (userId: string, supabase: SupabaseClient) => {
    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,published,published_on,title,description,language,bloggers(name,id),created_by,created_at"
        )
        .match({ created_by: userId, published: false })
        .order("created_at", { ascending: false })
        .limit(LIMIT + 1);
    return checkDataLength(data || [])
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

            // if (/^canvas-(\d+)\.png$/.test(file.name)) continue
            const { publicUrl } = supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).getPublicUrl(post.image_folder + "/" + file.name).data

            imagesToUrls[file.name] = publicUrl
        }
    }

    const content = (await getHtmlFromMarkdownFile(fileData)).content;

    const markdown = await fileData.text()

    return { post, content, imagesToUrls, markdown }
})