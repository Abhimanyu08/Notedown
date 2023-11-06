import matter from "gray-matter";
import { ALLOWED_LANGUAGES } from "./constants";


export type FrontMatter =
    { title?: string, description?: string, language?: typeof ALLOWED_LANGUAGES[number] | null, tags?: string[], slug?: string }


export function parseFrontMatter(markdown: string): { data: FrontMatter, content: string, frontMatterLength: number } {

    try {


        let fileMatter = matter(markdown);
        let data = fileMatter.data
        let content = fileMatter.content

        const frontMatterLength = markdown.length - content.length
        const slug = data.slug
        if (slug) {
            data.slug = slug.split(" ").join("-")
        }

        // html = resetCodeblocks(content, html)
        return { data: data as FrontMatter, content, frontMatterLength }
    } catch (_) {
        return { content: markdown, frontMatterLength: 0, data: { title: "Couldn't parse frontmatter" } }
    }

}
