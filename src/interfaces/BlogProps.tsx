import PostWithBlogger from "./PostWithBlogger";

export interface BlogProps extends PostWithBlogger {
	extraClasses: string;
	content: string;
	containerId: string;
	imageToUrl: Record<string, string>;
}
