import PostWithBlogger from "./PostWithBlogger";

export interface BlogProps extends PostWithBlogger {
	paddingClasses: string;
	content: string;
	containerId: string;
	imageToUrl: Record<string, string>;
}
