import { getPost } from "@/app/utils/getData";
import BlogContainer from "@components/BlogContainer";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { parseFrontMatter } from "@utils/getResources";
import { MemoExoticComponent } from "react";

function BlogLayout({
	postMeta,
	ToolbarComponent,
	AuthorComponent,
}: {
	postMeta: Partial<Awaited<ReturnType<typeof getPost>>>;
	ToolbarComponent?: () => JSX.Element;
	AuthorComponent:
		| React.MemoExoticComponent<() => JSX.Element>
		| (({ createdBy }: { createdBy: string }) => Promise<JSX.Element>);
}) {
	const { post, markdown } = postMeta;
	const { content, data } = parseFrontMatter(markdown || "");
	return (
		<div className="grow flex flex-row min-h-0 relative pt-20">
			<div
				className={`lg:basis-1/5 hidden flex-col overflow-y-auto justify-start lg:flex px-4 
					`}
			>
				<Toc markdown={content} />
			</div>
			<BlogContainer
				markdown={content}
				title={post?.title || data?.title || ""}
			>
				<Blog
					content={content}
					title={post?.title || data?.title || ""}
					description={post?.description || data?.description || ""}
					language={post?.language || data?.language || ("" as any)}
					extraClasses="mx-auto"
					AuthorComponent={AuthorComponent}
				/>
			</BlogContainer>
			{/* </div> */}
			<div className="hidden lg:flex lg:flex-col lg:basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
				{ToolbarComponent && <ToolbarComponent />}
			</div>
		</div>
	);
}

export default BlogLayout;
