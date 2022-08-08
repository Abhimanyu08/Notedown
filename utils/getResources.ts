import { readdirSync, readFileSync } from "fs";
import { join } from 'path';
import matter from "gray-matter";
import PostType from "../interfaces/PostType";


const postsDirectory = join(process.cwd(), '_posts')

export function getPostContent(title: string): PostType {

    const postFile = join(postsDirectory, `${title}.md`);
    console.log(postFile);
    const fileContent = readFileSync(postFile, 'utf-8');
    const { data, content } = matter(fileContent);
    return {
        ...data as { title: string, language: string },
        content
    }
}

export function getAllPostTitles() {
    const posts = readdirSync(postsDirectory)
    const titles = posts.map((post) => post.replace(/\.md$/, ''));
    return titles
}

