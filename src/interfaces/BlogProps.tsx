import PostWithBlogger from "./PostWithBlogger";

export interface BlogProps extends PostWithBlogger {
	content: string;
	containerId: string;
	author: string;
	markdown?: string;
}
