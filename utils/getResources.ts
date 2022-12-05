import matter from "gray-matter";
import { BlogProps } from "../src/interfaces/BlogProps";
import { ALLOWED_LANGUAGES, DESCRIPTION_LENGTH, SUPABASE_FILES_BUCKET, TITLE_LENGTH } from "./constants";
import mdToHtml from "./mdToHtml";
import { supabase } from "./supabaseClient";

function resetCodeblocks(markdown: string, html: string) {
    let mdMatchedArray = Array.from(
        markdown.matchAll(/(`{1,3})([^`]*?\r?\n)?((.|\n|\r)*?)(\r\n)?(\1)/g)
    )
    const mdMatched = mdMatchedArray.map((match) => match.at(3));
    const contentMatch = Array.from(
        html.matchAll(/<code>((.|\n|\r)*?)<\/code>/g)
    ).map((match) => match.at(1));

    for (let i = 0; i < mdMatched.length; i++) {
        html = html.replace(contentMatch[i]!, mdMatched[i]!);
    }
    return html;
}

export async function getHtmlFromMarkdown(file: File | Blob | string): Promise<{ data: { title: string, description: string, language?: typeof ALLOWED_LANGUAGES[number] }, content: string }> {

    let data: { [x: string]: any; language?: any; }, content;
    if (typeof file === "string") {

        let fileMatter = matter(file);
        data = fileMatter.data
        content = fileMatter.content
    } else {

        let fileMatter = matter(await file.text());
        data = fileMatter.data
        content = fileMatter.content

    }

    if (!data.title) {
        throw Error("Give your post a title");
    }
    if (!data.description) {
        throw Error("Give your post a description")
    }
    if (data.language !== undefined && !ALLOWED_LANGUAGES.some(val => val === data.language)) {
        throw Error("Mind Your Language! Supported languages are 'rust','python' and 'javascript'");
    }
    if (data.title.length > TITLE_LENGTH || (data.description?.length || 0) > DESCRIPTION_LENGTH) {
        throw Error(`Either title or description is too large. Max title length - ${TITLE_LENGTH}, Max description length - ${DESCRIPTION_LENGTH}`)
    }
    let html = await mdToHtml(content);
    html = resetCodeblocks(content, html)
    return { data: data as { title: string, description: string, language?: typeof ALLOWED_LANGUAGES[number] }, content: html }

}

export async function getAllPostTitles(): Promise<string[]> {
    const { data: posts, error } = await supabase.storage.from(SUPABASE_FILES_BUCKET).list();
    if (!posts || error) return []
    const titles = posts.map((post) => post.name.replace(/\.md$/, ''));
    return titles
}

