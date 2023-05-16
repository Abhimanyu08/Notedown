
export const SUPABASE_FILES_BUCKET = "blog-files";
export const SUPABASE_BLOGGER_TABLE = "bloggers"
export const SUPABASE_POST_TABLE = "posts"
export const SUPABASE_IMAGE_BUCKET = "blogger-images"
export const SUPABASE_UPVOTES_TABLE = "upvotes"
export const LIMIT = 1;
export const TITLE_LENGTH = 200;
export const DESCRIPTION_LENGTH = 500;
export const ABOUT_LENGTH = 1000;
export const PHOTO_LIMIT = 20;
export const CAROUSEL_LIMIT = 6;
export const SEARCH_UPVOTED_POSTS_FUNCTION = "search_upvotes_of_user"
export const SEARCH_PUBLC = "ranked_search_public"
export const SEARCH_PRIVATE = "ranked_search_private"
export const FILE_CHANGE_LIMIT = 5
export const ALLOWED_LANGUAGES = ["python", "javascript", "rust"] as const
export const LOCAL_MARKDOWN_KEY = "rce-markdown"
export const langToExtension = {
    python: ".py",
    javascript: ".js",
    rust: ".rs"
} as const
export const sleep = async (s: number) => new Promise((res) => setTimeout(res, s * 1000))


// 624,608,625,626,597,613,623,382,383