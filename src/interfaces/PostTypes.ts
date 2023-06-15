export const PostTypesList = [
    "latest",
    "greatest",
    "private",
    "upvoted",
    "drafts"
] as const;


export type PostTypes = typeof PostTypesList[number]
