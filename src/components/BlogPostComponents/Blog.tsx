import { BlogProps } from "@/interfaces/BlogProps";
import formatDate from "@utils/dateFormatter";
import { mdToHast, transformer } from "@utils/html2Jsx/transformer";
import { memo } from "react";

const Blog = memo(
	function Blog({
		title,
		description,
		content,
		created_by,
		published,
		published_on,
		created_at,
		extraClasses,
		AuthorComponent,
	}: Partial<BlogProps> & {
		AuthorComponent:
			| React.MemoExoticComponent<() => JSX.Element>
			| (({ createdBy }: { createdBy: string }) => Promise<JSX.Element>);
	}) {
		const { htmlAST } = mdToHast(content || "");
		const blogJsx = transformer(htmlAST);

		return (
			<div
				className={
					`
				overflow-x-hidden		
				// --------overflow-y-auto
				prose
				//-------------prose-headings------------
				prose-h1:mb-6
				prose-headings:text-black
				dark:prose-headings:text-gray-200
				prose-headings:font-serif

				// ---------prose-p--------------
				prose-p:text-black/80
				dark:prose-p:text-gray-400

				// -------------prose-li--------
				marker:prose-li:text-black
				dark:marker:prose-li:text-gray-200
				prose-li:text-black/80
				dark:prose-li:text-gray-400


				// -----------prose-strong-----------
				prose-strong:text-black
				dark:prose-strong:text-gray-200

				//-----------------prose-a-------------
				prose-a:text-black
				dark:prose-a:text-blue-400
				prose-a:no-underline
				hover:prose-a:underline
				hover:prose-a:underline-offset-2

				// ---------------prose-code---------------
				dark:prose-code:bg-gray-800
				dark:prose-code:text-gray-300
				prose-code:bg-white
				prose-code:text-black
				prose-code:font-mono
				prose-code:px-1 
				prose-code:rounded-sm
				prose-code:select-all

				

				// ---------------prose-em---------------
				prose-em:text-black
				dark:prose-em:text-gray-200

				//-----------------figcaption-------------

				prose-figcaption:text-black
				dark:prose-figcaption:text-gray-400

				//-----------------blockquote---------
				prose-blockquote:border-l-black 
				prose-blockquote:border-l-4
				dark:prose-blockquote:border-l-gray-300
				dark:prose-blockquote:text-gray-300
				prose-blockquote:text-black/80

				
				pb-20 md:pb-10 
				` +
					" " +
					extraClasses
				}
			>
				<header>
					<h1 className="text-left " id="title">
						{title}
					</h1>

					<blockquote className="text-left text-lg text-gray-400">
						{description}
					</blockquote>
					<div className="dark:text-gray-400 flex gap-2 not-prose text-xs md:text-sm text-black justify-start mb-10 md:mb-12">
						<span className="underline underline-offset-2 hover:italic decoration-black dark:decoration-gray-400">
							{/* @ts-expect-error Async Server Component  */}
							<AuthorComponent createdBy={created_by} />
						</span>
						<span>.</span>
						<span className="">
							{published && published_on
								? formatDate(published_on)
								: created_at
								? formatDate(created_at)
								: formatDate(new Date().toDateString())}
						</span>
					</div>
				</header>
				<article className="" id="jsx">
					{blogJsx}
				</article>
			</div>
			// </BlogContext.Provider>
		);
	},
	(prevProps, newProps) => {
		return (
			prevProps.content === newProps.content &&
			prevProps.title === newProps.title &&
			prevProps.description === newProps.description
		);
	}
);

export default Blog;
