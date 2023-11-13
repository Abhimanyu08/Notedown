"use server"
import { revalidatePath } from "next/cache";
import { SUPABASE_POST_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET } from "../utils/constants";
import { cookies, headers } from "next/headers";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";

// function getPostActions(supabase: SupabaseClient) {


export async function publishPostAction(postId: number) {
    const supabase = createSupabaseServerClient(
        cookies,
    )
    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .update({
            published: true,
            published_on: new Date().toISOString(),
        })
        .match({ id: postId }).select("created_by").single();

    if (data) {

        revalidatePath(`/profile/${data.created_by}`, "layout");
    }
}

export async function unpublishPostAction(postId: number) {
    const supabase = createSupabaseServerClient(
        cookies,
    )
    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .update({
            published: false,
        })
        .match({ id: postId }).select("created_by").single();


    if (data) {

        revalidatePath(`/profile/${data.created_by}`, "layout");
    }
}

export async function deletePostAction(postId: number) {
    const supabase = createSupabaseServerClient(
        cookies,
    )
    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .delete()
        .match({ id: postId })
        .select("filename, image_folder, published,created_by")
        .single();

    const userId = (await supabase.auth.getSession()).data.session?.user.id

    if (data) {
        const imageFolder = data.image_folder || `${userId}/${postId}`
        const { data: files } = await supabase.storage
            .from(SUPABASE_FILES_BUCKET)
            .list(imageFolder);

        if (files) {
            const fileNames = files.map(
                (i) => `${imageFolder}/${i.name}`
            );
            const { data, error } = await supabase.storage
                .from(SUPABASE_FILES_BUCKET)
                .remove(fileNames);
        }

        const { data: imageFiles } = await supabase.storage
            .from(SUPABASE_IMAGE_BUCKET)
            .list(imageFolder);

        if (imageFiles) {
            const imageNames = imageFiles.map(
                (i) => `${imageFolder}/${i.name}`
            );
            await supabase.storage
                .from(SUPABASE_IMAGE_BUCKET)
                .remove(imageNames);
        }
        revalidatePath(`/profile/${data.created_by}`, "layout");
    }
}


//     return [publishPostAction, unpublishPostAction, deletePostAction]
// }

