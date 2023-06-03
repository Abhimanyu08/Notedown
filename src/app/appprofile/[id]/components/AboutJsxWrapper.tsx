import parser from "@utils/html2Jsx/parser";
import tokenizer from "@utils/html2Jsx/tokenizer";
import transformer from "@utils/html2Jsx/transformer";
import { memo } from "react";

const AboutJsxWrapper = memo(function ({ html }: { html: string }) {
	const jsx = transformer(parser(tokenizer(html)));

	return (
		<div
			className="

				scroll-smooth   
				// max-w-none 
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
				scrollbar-thumb-slate-700
				
		 "
		>
			{jsx}
		</div>
	);
});

export default AboutJsxWrapper;
