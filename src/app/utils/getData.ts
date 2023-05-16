import 'server-only';
import { LIMIT, SUPABASE_BLOGGER_TABLE, SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import { cache } from "react";

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

