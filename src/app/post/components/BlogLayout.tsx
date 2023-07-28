import { getPost } from "@/app/utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import Toc from "@components/BlogPostComponents/TableOfContents";
import React from "react";
import BlogContextProvider from "../../../components/BlogPostComponents/BlogState";
import Toolbar from "./Toolbar";
import PrivateToolbar from "./PrivateToolbar";
import { parseFrontMatter } from "@utils/getResources";

function BlogLayout({
	postMeta,
	isPostPrivate,
}: {
	postMeta: Awaited<ReturnType<typeof getPost>>;
	isPostPrivate: boolean;
}) {
	const { post, imagesToUrls, markdown } = postMeta;
	const { content } = parseFrontMatter(markdown);
	return (
		<BlogContextProvider
			blogMeta={{
				id: post.id,
				title: post.title,
				description: post.description,
				language: post.language,
				imageFolder: post.image_folder,
				blogger: post.bloggers as { id: string; name: string },
			}}
			uploadedImages={imagesToUrls}
		>
			<div className="grow flex flex-row min-h-0 relative [&>*]:pt-20">
				<div
					className={`lg:basis-1/5 flex-col overflow-y-auto justify-start flex px-4 
					`}
				>
					<Toc html={content} />
				</div>
				<div
					className={`lg:basis-3/5 relative 
							hidden lg:block
							overflow-y-hidden

							`}
				>
					<Blog
						content={content}
						{...post}
						extraClasses="mx-auto"
						AuthorComponent={BlogAuthorServer}
					/>
				</div>
				<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
					{isPostPrivate ? <PrivateToolbar /> : <Toolbar />}
				</div>
			</div>
		</BlogContextProvider>
	);
}

export default BlogLayout;
