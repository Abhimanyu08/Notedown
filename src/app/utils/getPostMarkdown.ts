import PostWithBlogger from "@/interfaces/PostWithBlogger";
import { SUPABASE_POST_TABLE, SUPABASE_FILES_BUCKET } from "@utils/constants";
import { getHtmlFromMarkdownFile } from "@utils/getResources";
import { supabase } from "@utils/supabaseClient";


export async function getPostMarkdown(postId: string) {


    const { data: post, error } = await supabase
        .from(SUPABASE_POST_TABLE)
        .select(
            "id,created_by,title,description,language,published_on,filename,image_folder, bloggers(name)"
        )
        .match({ id: postId })
        .single();

    if (error || !post) return { post: null, content: null };

    const filename = post.filename;

    if (!filename) return { post, content: null }
    const { data: fileData, error: fileError } = await supabase.storage
        .from(SUPABASE_FILES_BUCKET)
        .download(filename);

    if (!fileData) return { post, content: null }

    const content = (await getHtmlFromMarkdownFile(fileData)).content;
    return { post, content }
}