export const PostTypesList = [
    "latest",
    "greatest",
    "private",
    "upvoted",
    "postpreview",
] as const;


export type PostTypes = typeof PostTypesList[number]
