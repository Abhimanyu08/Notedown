import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE } from "./constants";

function getPostActionFunctions(headers: () => any, cookies: () => any, revalidatePath: (path: string) => void) {


    async function publishPostAction(postId: number) {
        "use server";
        const supabase = createServerComponentSupabaseClient({
            headers,
            cookies,
        });
        await supabase
            .from(SUPABASE_POST_TABLE)
            .update({
                published: true,
                published_on: new Date().toISOString(),
            })
            .match({ id: postId });

        revalidatePath("/profile/[id]/public");
    }

    async function unpublishPostAction(postId: number) {
        "use server";
        const supabase = createServerComponentSupabaseClient({
            headers,
            cookies,
        });
        await supabase
            .from(SUPABASE_POST_TABLE)
            .update({
                published: false,
            })
            .match({ id: postId });

        revalidatePath("/profile/[id]/public");
    }

    async function deletePostAction(postId: number) {
        "use server";
        const supabase = createServerComponentSupabaseClient({
            headers,
            cookies,
        });
        const { data } = await supabase
            .from(SUPABASE_POST_TABLE)
            .delete()
            .match({ id: postId })
            .select("filename, image_folder, published")
            .single();

        if (data) {
            await supabase.storage
                .from(SUPABASE_FILES_BUCKET)
                .remove([data?.filename]);

            const { data: imageFiles } = await supabase.storage
                .from(SUPABASE_IMAGE_BUCKET)
                .list(data.image_folder);

            if (imageFiles) {
                const imageNames = imageFiles.map(
                    (i) => `${data.image_folder}/${i.name}`
                );
                await supabase.storage
                    .from(SUPABASE_IMAGE_BUCKET)
                    .remove(imageNames);
            }
            if (data.published) {
                revalidatePath("/profile/[id]/public");
            } else {
                revalidatePath("/profile/[id]/private");
            }
        }
    }

    return [publishPostAction, unpublishPostAction, deletePostAction]

}

export default getPostActionFunctions