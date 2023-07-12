export const PostTypesList = [
    "public",
    "private",
    "drafts"
] as const;


export type PostTypes = typeof PostTypesList[number]
