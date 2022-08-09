import matter from "gray-matter";
import { SUPABASE_BUCKET_NAME } from "./constants";
import mdToHtml from "./mdToHtml";
import { supabase } from "./supabaseClient";



export async function getPostContent(title: string): Promise<{ title: string, language: string, description: string, content: string }> {

    const { data: fileData, error } = await supabase.storage.from(SUPABASE_BUCKET_NAME).download(`${title}`);
    if (!fileData || error) throw new Error(
        error?.message || `File named ${title} does not exist`
    )

    const { data, content } = matter(await fileData.text());
    return {
        ...data as { title: string, language: string, description: string },
        content: await mdToHtml(content)
    }
}

export async function getAllPostTitles(): Promise<string[]> {
    const { data: posts, error } = await supabase.storage.from(SUPABASE_BUCKET_NAME).list();
    if (!posts || error) return []
    const titles = posts.map((post) => post.name.replace(/\.md$/, ''));
    return titles
}

