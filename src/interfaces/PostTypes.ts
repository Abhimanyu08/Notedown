export const PostTypesList = [
    "notes",
    "drafts"
] as const;


export type PostTypes = typeof PostTypesList[number]
