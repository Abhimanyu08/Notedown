"use server";

import { createServerComponentSupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";


export async function publishPostAction({ postId }: { postId: number }) {


    const supabase = createServerComponentSupabaseClient({ headers, cookies })
    await supabase.from(SUPABASE_POST_TABLE).update({
        published: true,
        published_on: new Date().toISOString()
    })
        .match({ id: postId })

    const { data } = await supabase.auth.getUser()

    const profileId = data.user?.id
    console.log(profileId)

    revalidatePath(`/appprofile/${profileId}/posts/latest`)
    revalidatePath(`/appprofile/${profileId}/posts/private`)
}