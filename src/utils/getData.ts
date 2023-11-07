import 'server-only';
import { LIMIT, SUPABASE_BLOGGER_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE, SUPABASE_UPVOTES_TABLE } from "@utils/constants";
import { cache } from "react";
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@utils/supabaseClient';
import { checkDataLength } from './postTypeToFetcher';
import { Database } from '@/interfaces/supabase';
import PostWithBlogger from '@/interfaces/PostWithBlogger';

export const getUser = async (id: string) => {

    const { data: userData } = await supabase
        .from(SUPABASE_BLOGGER_TABLE)
        .select("id,name,username,notebook_title")
        .eq("id", id)
        .single();

    return userData
}



export const getPost = async (postIdOrSlug: string, supabaseClient: SupabaseClient) => {

    let post: PostWithBlogger | null
    let postMetaError: PostgrestError | null
    if (isNaN(parseInt(postIdOrSlug))) {

        const { data, error } = await supabaseClient
            .from<"posts", Database["public"]["Tables"]["posts"]>(SUPABASE_POST_TABLE)
            .select(
                "id,created_by,timestamp,title,description,language,published_on,published,created_at,filename,image_folder,bloggers(id,name),slug"
            )
            .eq("slug", postIdOrSlug)
            .single();
        post = data
        postMetaError = error
    } else {

        const { data, error } = await supabaseClient
            .from<"posts", Database["public"]["Tables"]["posts"]>(SUPABASE_POST_TABLE)
            .select(
                "id,created_by,timestamp,title,description,language,published_on,published,created_at,filename,image_folder,bloggers(id,name),slug"
            )
            .eq("id", postIdOrSlug)
            .single();
        post = data
        postMetaError = error
    }

    if (postMetaError || !post) {
        throw new Error(postMetaError?.message || "post not found")
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
    if (post.image_folder) {

        const { data } = await supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).list(post.image_folder)
        if (data) {
            for (let file of data) {

                // if (/^canvas-(\d+)\.png$/.test(file.name)) continue
                const { publicUrl } = supabaseClient.storage.from(SUPABASE_IMAGE_BUCKET).getPublicUrl(post.image_folder + "/" + file.name).data

                imagesToUrls[file.name] = publicUrl
            }
        }
    }


    const { data: fileObjects } = await supabaseClient.storage.from(SUPABASE_FILES_BUCKET).list(`${post.created_by}/${post.id}`)
    const fileNames = fileObjects?.map(f => f.name)

    const markdown = await fileData.text()

    return { post, imagesToUrls, markdown, fileNames }
}