import Blogger from "interfaces/Blogger";
import Post from "interfaces/Post";
import PostWithBlogger from "interfaces/PostWithBlogger";
import { ProfileUser } from "interfaces/ProfileUser";
import React from "react";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_POST_TABLE,
	LIMIT,
} from "@utils/constants";
// import { supabase } from "@/utils/constants";
import Image from "next/image";
import ProfileControl from "./ProfileControl";
import { supabase } from "@utils/supabaseClient";
import error from "next/error";
import transformer from "@utils/html2Jsx/transformer";
import parser from "@utils/html2Jsx/parser";
import tokenizer from "@utils/html2Jsx/tokenizer";
import mdToHtml from "@utils/mdToHtml";

async function About({ params }: { params: { id: string } }) {
	const { data: userData } = await supabase
		.from<Blogger>(SUPABASE_BLOGGER_TABLE)
		.select("id,name,avatar_url,about,twitter,github,web")
		.eq("id", params.id)
		.single();

	const aboutHtml = await mdToHtml(userData?.about || "");

	return (
		<>
			<h1 className="text-3xl tracking-normal">{userData?.name}</h1>
			<AboutJsxWrapper>
				{transformer(parser(tokenizer(aboutHtml)), {})}
			</AboutJsxWrapper>
		</>
	);
}

const AboutJsxWrapper = ({ children }: { children: JSX.Element }) => {
	return (
		<div
			className="

				prose prose-sm
				//-------------prose-headings------------
				prose-headings:text-black
				dark:prose-headings:text-gray-200
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
				dark:prose-p:text-font-grey

				// -------------prose-li--------
				marker:prose-li:text-black
				dark:marker:prose-li:text-white
				prose-li:text-black/80
				prose-li:font-sans
				md:prose-li:text-[16px]	
				prose-li:leading-7
				dark:prose-li:text-font-grey

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
			dark:prose-code:text-gray-200
			prose-code:bg-white
			prose-code:text-black
			prose-code:px-2 
			md:prose-code:text-sm 
				prose-code:rounded-md
				prose-code:select-all

			prose-em:text-black
			dark:prose-em:text-gray-100

			//-----------------figcaption-------------

				prose-figcaption:text-black
				dark:prose-figcaption:text-font-grey

prose-blockquote:border-l-black prose-blockquote:border-l-4
dark:prose-blockquote:border-l-gray-300
dark:prose-blockquote:text-font-grey
prose-blockquote:text-black/80
				  prose-h1:mb-6   
				
		 "
		>
			{children}
		</div>
	);
};

export default About;
