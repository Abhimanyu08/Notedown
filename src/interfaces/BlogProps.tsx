import PostWithBlogger from "./PostWithBlogger";

export interface BlogProps extends PostWithBlogger {
	extraClasses: string;
	markdown: string;
	containerId: string;
	imageToUrl: Record<string, string>;
}
