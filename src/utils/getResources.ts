import matter from "gray-matter";
import { ALLOWED_LANGUAGES, DESCRIPTION_LENGTH, SUPABASE_FILES_BUCKET, TITLE_LENGTH } from "./constants";
import { supabase } from "./supabaseClient";



export function parseFrontMatter(markdown: string): { data: { title?: string, description?: string, language?: typeof ALLOWED_LANGUAGES[number] | null }, content: string, frontMatterLength: number } {

    try {

        let data: { [x: string]: any; language?: any; }, content;

        let fileMatter = matter(markdown);
        data = fileMatter.data
        content = fileMatter.content

        const frontMatterLength = markdown.length - content.length

        // html = resetCodeblocks(content, html)
        return { data: data as { title: string, description: string, language: typeof ALLOWED_LANGUAGES[number] }, content, frontMatterLength }
    } catch (_) {
        return { content: markdown, frontMatterLength: 0, data: { title: "Couldn't parse frontmatter" } }
    }

}

export async function getAllPostTitles(): Promise<string[]> {
    const { data: posts, error } = await supabase.storage.from(SUPABASE_FILES_BUCKET).list();
    if (!posts || error) return []
    const titles = posts.map((post) => post.name.replace(/\.md$/, ''));
    return titles
}

