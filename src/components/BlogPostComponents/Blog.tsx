import { BlogProps } from "@/interfaces/BlogProps";
import formatDate from "@utils/dateFormatter";
import { memo } from "react";

const Blog = memo(function Blog({
	title,
	description,
	markdown,
	created_by,
	published,
	published_on,
	created_at,
	extraClasses,
	AuthorComponent,
	children,
}: Partial<BlogProps> & {
	AuthorComponent:
		| React.MemoExoticComponent<() => JSX.Element>
		| (({ createdBy }: { createdBy: string }) => Promise<JSX.Element>)
		| (() => JSX.Element);

	children?: React.ReactNode;
}) {
	return (
		<div
			className={
				`
				overflow-x-hidden		
				// --------overflow-y-auto
				prose
				prose-sm
				lg:prose-lg
				mx-4 lg:mx-auto
				//-------------prose-headings------------
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
				prose-li:pl-[19.2px]
				prose-ol:pl-[19.2px]


				// -----------prose-strong-----------
				prose-strong:text-black
				dark:prose-strong:text-gray-300

				//-----------------prose-a-------------
				prose-a:text-black
				dark:prose-a:text-blue-400
				prose-a:no-underline
				hover:prose-a:underline
				hover:prose-a:underline-offset-2

				// ---------------prose-code---------------
				dark:prose-code:bg-secondary
				dark:prose-code:text-gray-300
				prose-code:bg-white
				prose-code:text-black
				prose-code:font-mono
				prose-code:font-normal
				prose-code:px-2 
				prose-code:rounded-sm
				prose-code:select-all

				

				// ---------------prose-em---------------
				prose-em:text-black
				dark:prose-em:text-gray-300

				//-----------------figcaption-------------

				prose-figcaption:text-black
				dark:prose-figcaption:text-gray-400

				//-----------------blockquote---------
				prose-blockquote:border-l-black 
				prose-blockquote:border-l-4
				dark:prose-blockquote:border-l-gray-300
				dark:prose-blockquote:text-gray-300
				prose-blockquote:text-black/80
				prose-blockquote:not-italic

				
				pb-20 md:pb-10 
				` +
				" " +
				extraClasses
			}
		>
			<header className="mb-20">
				<h1 className="text-left " id="title">
					{title}
				</h1>

				<span className="text-left block text-xl mb-10 text-gray-400 ">
					{description}
				</span>
				<div className="dark:text-gray-400 flex items-center not-prose gap-2 text-xs  text-black justify-start not-prose">
					<AuthorComponent createdBy={created_by || ""} />
					<span className="first:hidden">.</span>
					<span>
						{published && published_on
							? formatDate(published_on)
							: created_at
							? formatDate(created_at)
							: formatDate(new Date().toDateString())}
					</span>
					<div className="grow border-t-[0.2px] border-b-0 border-gray-600"></div>
				</div>
			</header>
			<article className="" id="jsx">
				{children}
			</article>
		</div>
		// </BlogContext.Provider>
	);
});

export default Blog;
