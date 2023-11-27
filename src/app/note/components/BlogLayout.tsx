import BlogContainer from "@components/BlogContainer";
import Blog from "@components/BlogPostComponents/Blog";
import Footers from "@components/BlogPostComponents/Footers";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import { getPost } from "@utils/getData";
import { tagToJsxConverterWithContext } from "@utils/html2Jsx/minimalJsxConverter";
import { mdToHast, transformer } from "@utils/html2Jsx/transformer";
import { parseFrontMatter } from "@utils/parseFrontMatter";

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

	const tagToJsx = tagToJsxConverterWithContext({
		fileNamesToUrls: postMeta.imagesToUrls!,
		language: post?.language as
			| (typeof ALLOWED_LANGUAGES)[number]
			| undefined,
		imageFolder: `${post?.created_by}/${post?.id}`,
	});

	const { htmlAST } = mdToHast(content || "");
	const blogJsx = transformer(htmlAST, tagToJsx);

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
					created_by={post?.created_by}
					extraClasses="mx-auto"
					AuthorComponent={AuthorComponent}
				>
					{blogJsx}

					{tagToJsx.footnotes!.length > 0 && (
						<Footers
							footNotes={tagToJsx.footnotes!}
							tagToJsxConverter={tagToJsx}
						/>
					)}
				</Blog>
			</BlogContainer>
			{/* </div> */}
			<div className="hidden lg:flex lg:flex-col lg:basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
				{ToolbarComponent && <ToolbarComponent />}
			</div>
		</div>
	);
}

export default BlogLayout;
