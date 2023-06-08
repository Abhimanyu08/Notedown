// "use client";
import { BlogProps } from "@/interfaces/BlogProps";
import formatDate from "@utils/dateFormatter";
import parser from "@utils/html2Jsx/parser";
import tokenizer from "@utils/html2Jsx/tokenizer";
import transformer from "@utils/html2Jsx/transformer";
import Link from "next/link";
import { memo } from "react";
import BlogAuthor from "./BlogAuthor";

const Blog = memo(
	function Blog({
		title,
		description,
		content,
		created_by,
		bloggers,
		published,
		published_on,
		created_at,
		extraClasses = "px-20",
	}: Partial<BlogProps>) {
		const tokens = tokenizer(content || "");
		let blogger = bloggers as { id: string; name: string };
		const parsedOutput = parser(tokens);

		const blogJsx = transformer(parsedOutput);

		return (
			<div
				className={
					`
				scroll-smooth   
				// max-w-none 
				h-full 
				overflow-x-hidden		
				// --------overflow-y-auto
				prose prose-sm
				//-------------prose-headings------------
				prose-headings:text-black
				dark:prose-headings:text-white
				prose-headings:font-sans
				prose-h2:text-[26px]
				prose-h3:text-[24px]
				prose-h4:text-[22px]
				prose-h5:text-[20px]
				prose-h6:text-[18px]
				// ---------prose-p--------------
				prose-p:text-left
				md:prose-p:text-[16px]	
				prose-p: leading-7
				prose-p:font-sans
				prose-p:tracking-normal
				prose-p:text-black/80
				dark:prose-p:text-gray-300

				// -------------prose-li--------
				marker:prose-li:text-black
				dark:marker:prose-li:text-white
				prose-li:text-black/80
				prose-li:font-sans
				md:prose-li:text-[16px]	
				prose-li:leading-7
				dark:prose-li:text-gray-300

				// -----------prose-string-----------
				prose-strong:font-bold
				prose-strong:text-black
				dark:prose-strong:text-gray-100
				prose-strong:tracking-wide

				//-----------------prose-a-------------
				prose-a:text-black
				dark:prose-a:text-blue-400
				prose-a:font-semibold
				prose-a:no-underline
				hover:prose-a:underline
				hover:prose-a:underline-offset-2

				// ---------------prose-code---------------
				dark:prose-code:bg-gray-800
				dark:prose-code:text-gray-300
				prose-code:bg-white
				prose-code:text-black
				prose-code:px-2 
				md:prose-code:text-sm 
				prose-code:rounded-sm
				prose-code:select-all

				// ---------------prose-em---------------
				prose-em:text-black
				dark:prose-em:text-gray-100

				//-----------------figcaption-------------

				prose-figcaption:text-black
				dark:prose-figcaption:text-gray-400

				//-----------------blockquote---------
				prose-blockquote:border-l-black 
				prose-blockquote:border-l-4
				dark:prose-blockquote:border-l-gray-300
				dark:prose-blockquote:text-gray-300
				prose-blockquote:text-black/80
				  prose-h1:mb-6   
				
				pb-20 md:pb-10 
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700 ` +
					" " +
					extraClasses
				}
			>
				<header>
					<h1 className="text-left " id="title">
						{title}
					</h1>
					<blockquote className="text-left text-lg">
						{description}
					</blockquote>
					<div className="dark:text-font-grey flex gap-2 not-prose text-xs md:text-sm text-black justify-start mb-10 md:mb-12 mt-5">
						<span>by</span>
						<span className="underline underline-offset-2 hover:italic decoration-black dark:decoration-white">
							<BlogAuthor createdBy={created_by || null} />
						</span>
						<span>on</span>
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
