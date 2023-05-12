import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { SUPABASE_POST_TABLE, SUPABASE_FILES_BUCKET } from "@utils/constants";
import { getHtmlFromMarkdown } from "@utils/getResources";
import { supabase } from "@utils/supabaseClient";


export async function getPostMarkdown(postId: string) {

    const { data: post, error } = await supabase
        .from<PostWithBlogger>(SUPABASE_POST_TABLE)
        .select(
            "id,created_by,title,description,language,published_on,filename,image_folder, bloggers(name)"
        )
        .match({ id: postId })
        .single();

    if (error || !post) return { props: {}, redirect: "/" };

    const filename = post.filename;
    const { data: fileData, error: fileError } = await supabase.storage
        .from(SUPABASE_FILES_BUCKET)
        .download(filename);

    if (fileError || !fileData) return { props: {}, redirect: "/" };
    const content = (await getHtmlFromMarkdown(fileData)).content;
    return { post, content }
}