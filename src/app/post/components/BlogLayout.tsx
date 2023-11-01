import BlogContainer from "@components/BlogContainer";
import Blog from "@components/BlogPostComponents/Blog";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { getPost } from "@utils/getData";
import { parseFrontMatter } from "@utils/getResources";

function BlogLayout({
	postMeta,
	ToolbarComponent,
	AuthorComponent,
}: {
	postMeta: Partial<Awaited<ReturnType<typeof getPost>>>;
	ToolbarComponent?: () => JSX.Element;
	AuthorComponent: Parameters<typeof Blog>["0"]["AuthorComponent"];
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
				content={content}
				title={post?.title || data?.title || ""}
			>
				<Blog
					markdown={markdown}
					title={post?.title || data?.title || ""}
					description={post?.description || data?.description || ""}
					created_by={post?.created_by}
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
