"use server"
import { revalidatePath } from "next/cache";
import { SUPABASE_POST_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET } from "../utils/constants";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";

// function getPostActions(supabase: SupabaseClient) {


export async function publishPostAction(postId: number) {
    const supabase = createServerComponentSupabaseClient({
        cookies,
        headers
    })
    await supabase
        .from(SUPABASE_POST_TABLE)
        .update({
            published: true,
            published_on: new Date().toISOString(),
        })
        .match({ id: postId });

    revalidatePath("/profile/[id]");
    revalidatePath("/profile/[id]/public");
    revalidatePath("/profile/[id]/private");
}

export async function unpublishPostAction(postId: number) {
    const supabase = createServerComponentSupabaseClient({
        cookies,
        headers
    })
    await supabase
        .from(SUPABASE_POST_TABLE)
        .update({
            published: false,
        })
        .match({ id: postId });


    revalidatePath("/profile/[id]");
    revalidatePath("/profile/[id]/public");
    revalidatePath("/profile/[id]/private");
}

export async function deletePostAction(postId: number) {
    const supabase = createServerComponentSupabaseClient({
        cookies,
        headers
    })
    const { data } = await supabase
        .from(SUPABASE_POST_TABLE)
        .delete()
        .match({ id: postId })
        .select("filename, image_folder, published,created_by")
        .single();

    if (data) {
        const imageFolder = data.image_folder || `${data.created_by}/${postId}`
        const { data: files } = await supabase.storage
            .from(SUPABASE_FILES_BUCKET)
            .list(imageFolder);

        if (files) {
            const fileNames = files.map(
                (i) => `${imageFolder}/${i.name}`
            );
            await supabase.storage
                .from(SUPABASE_IMAGE_BUCKET)
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
        revalidatePath("/profile/[id]");
        revalidatePath("/profile/[id]/public");
        revalidatePath("/profile/[id]/private")
    }
}


//     return [publishPostAction, unpublishPostAction, deletePostAction]
// }

