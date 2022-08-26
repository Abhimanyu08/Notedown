import matter from "gray-matter";
import { SUPABASE_BUCKET_NAME } from "./constants";
import mdToHtml from "./mdToHtml";
import { supabase } from "./supabaseClient";

function resetCodeblocks(markdown: string, html: string) {
    const mdMatched = Array.from(
        markdown.matchAll(/```.*\r\n((.|\n|\r)*?)\r\n```/g)
    ).map((match) => match.at(1));
    const contentMatch = Array.from(
        html.matchAll(/<code>((.|\n|\r)*?)<\/code>/g)
    ).map((match) => match.at(1));

    for (let i = 0; i < mdMatched.length; i++) {
        html = html.replace(contentMatch[i]!, mdMatched[i]!);
    }
    return html;
}

export async function getHtmlFromMarkdown(file: File | Blob): Promise<string> {

    const { content } = matter(await file.text());
    let html = await mdToHtml(content);
    html = resetCodeblocks(content, html)
    return html
}

export async function getAllPostTitles(): Promise<string[]> {
    const { data: posts, error } = await supabase.storage.from(SUPABASE_BUCKET_NAME).list();
    if (!posts || error) return []
    const titles = posts.map((post) => post.name.replace(/\.md$/, ''));
    return titles
}

