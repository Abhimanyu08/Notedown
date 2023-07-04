import { getPost } from "@/app/utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import Toc from "@components/BlogPostComponents/TableOfContents";
import React from "react";
import BlogContextProvider from "../../../components/BlogPostComponents/BlogState";
import Toolbar from "./Toolbar";
import PrivateToolbar from "./PrivateToolbar";
import BlogAuthorClient from "@components/BlogPostComponents/BlogAuthorClient";

function BlogLayout({
	postMeta,
	isPostPrivate,
}: {
	postMeta: Omit<Awaited<ReturnType<typeof getPost>>, "markdown">;
	isPostPrivate: boolean;
}) {
	const { post, content, imagesToUrls } = postMeta;
	return (
		<BlogContextProvider
			blogMeta={{
				id: parseInt(post.id),
				title: post.title,
				description: post.description,
				language: post.language,
				imageFolder: post.image_folder,
			}}
			uploadedImages={imagesToUrls}
		>
			<div className="grow flex flex-row min-h-0 relative pt-10">
				<div
					className={`lg:basis-1/5 w-full flex-col max-w-full overflow-y-auto justify-start flex
					`}
				>
					<Toc html={content} />
				</div>
				<div
					className={`lg:basis-3/5 relative 
							hidden lg:block
							overflow-y-hidden`}
				>
					<Blog
						content={content}
						{...post}
						extraClasses="mx-auto"
						AuthorComponent={BlogAuthorServer}
					/>
				</div>
				<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
					{isPostPrivate ? (
						<PrivateToolbar language={post.language} />
					) : (
						<Toolbar language={post?.language} id={post.id} />
					)}
				</div>
			</div>
		</BlogContextProvider>
	);
}

export default BlogLayout;
