// "use client";
import Link from "next/link";
import formatDate from "@utils/dateFormatter";
import tokenizer from "@utils/html2Jsx/tokenizer";
import transformer from "@utils/html2Jsx/transformer";
import parser from "@utils/html2Jsx/parser";
import { BlogProps } from "@/interfaces/BlogProps";
import { useMemo } from "react";

export function Blog({
	title,
	description,
	content,
	language,
	created_by,
	image_folder,
	bloggers,
	imageToUrl,
	published,
	published_on,
	created_at,
	extraClasses,
}: Partial<BlogProps>) {
	// useLexica({ content });
	//THis shouldn't be a client component.

	const tokens = useMemo(() => tokenizer(content || ""), [content]);
	const parsedOutput = useMemo(() => parser(tokens), [tokens]);

	const blogJsx = useMemo(
		() =>
			transformer(parsedOutput, {
				language,
				imageFolder: image_folder,
				imageToUrl,
			}),
		[parsedOutput]
	);
	// const blogJsx = useMemo(() => {
	// 	if (!content) return <></>;
	// 	const tokens = tokenizer(content);
	// 	const parsedOutput = parser(tokens);
	// 	const jsx = transformer(parsedOutput, {
	// 		language,
	// 		imageFolder: image_folder,
	// 		imageToUrl,
	// 	});
	// 	return jsx;

	// 	// return htmlToJsx({
	// 	// 	html: content,
	// 	// 	language: language,
	// 	// 	imageFolder: image_folder || undefined,
	// 	// 	imageToUrl,
	// 	// });
	// }, [content, language]);

	// useEffect(() => {
	// 	const fetchAuthor = async (created_by: string) => {
	// 		//fetching author here because author may have changed his displayname
	// 		// and I will blow my head off before attempting to revalidate each one of his single posts
	// 		//just because that maniac changed his username from josh to joshua

	// 		const { data } = await supabase
	// 			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
	// 			.select("name")
	// 			.eq("id", created_by || "");
	// 		if (data) setAuthor(data.at(0)?.name || undefined);
	// 	};
	// 	if (created_by) fetchAuthor(created_by);
	// }, [created_by]);

	// useEffect(() => {
	// 	if (runningBlock === undefined && writingBlock === undefined) return;
	// 	if (runningRceRequest) {
	// 		setBlockToOutput({
	// 			[(runningBlock || writingBlock) as number]:
	// 				"Previous request is pending, please wait",
	// 		});
	// 		return;
	// 	}
	// 	if (!language || !containerId) {
	// 		if (!containerId) {
	// 			setBlockToOutput({
	// 				[(runningBlock || writingBlock) as number]:
	// 					"Please enable remote code execution",
	// 			});
	// 		}
	// 		setRunningBlock(undefined);
	// 		setWritingBlock(undefined);
	// 		// setRunningCode(false);
	// 		return;
	// 	}

	// 	setRunningRceRequest(true);

	// 	let block: number;
	// 	if (typeof runningBlock === "number") {
	// 		block = runningBlock;
	// 	} else {
	// 		block = writingBlock as number;
	// 	}
	// 	// if the current block contains a file comment at the top then only collect code from blocks which contain the same
	// 	// comment on top of them
	// 	const firstLine = blockToEditor[block].state.doc
	// 		.toJSON()
	// 		.filter((l) => l !== "")
	// 		.at(0);
	// 	const fileName = checkFileName(firstLine || "");
	// 	let codeArray: string[] = [];

	// 	for (let i = 0; i <= block; i++) {
	// 		if (document.getElementById(`codearea-${i}`)) {
	// 			let blockCodeArray = blockToEditor[i].state.doc
	// 				.toJSON()
	// 				.filter((l) => l !== "");
	// 			const firstLineOfBlock = blockCodeArray[0];
	// 			if (!fileName) {
	// 				if (!checkFileName(firstLineOfBlock)) {
	// 					codeArray = codeArray.concat(blockCodeArray);
	// 				}
	// 			} else {
	// 				const blockFileName = checkFileName(firstLineOfBlock);
	// 				if (
	// 					blockFileName === fileName ||
	// 					blockFileName + langToExtension[language] ===
	// 						fileName ||
	// 					blockFileName === fileName + langToExtension[language]
	// 				) {
	// 					codeArray = codeArray.concat(blockCodeArray.slice(1));
	// 				}
	// 			}
	// 		}
	// 	}

	// 	const code = codeArray.join("\n");
	// 	const run = writingBlock === undefined;

	// 	runCodeRequest({ code, run, containerId, fileName, language }).then(
	// 		(val) => {
	// 			setBlockToOutput((prev) => ({ ...prev, [block]: val }));
	// 			setRunningBlock(undefined);
	// 			setWritingBlock(undefined);
	// 			setRunningRceRequest(false);
	// 		}
	// 	);
	// }, [runningBlock, writingBlock]);

	return (
		// <BlogContext.Provider
		// 	value={{
		// 		containerId,
		// 		blockToOutput,
		// 		setBlockToOutput,
		// 		vimEnabled,
		// 		setVimEnabled,
		// 		setRunningBlock,
		// 		setWritingBlock,
		// 		setBlockToEditor,
		// 	}}
		// >
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

				// ---------------prose-em---------------
				prose-em:text-black
				dark:prose-em:text-gray-100

				//-----------------figcaption-------------

				prose-figcaption:text-black
				dark:prose-figcaption:text-font-grey

				//-----------------blockquote---------
				prose-blockquote:border-l-black 
				prose-blockquote:border-l-4
				dark:prose-blockquote:border-l-gray-300
				dark:prose-blockquote:text-font-grey
				prose-blockquote:text-black/80
				  prose-h1:mb-6   
				
				pb-20 md:pb-10 
				lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700` +
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
					<span className="underline underline-offset-2 decoration-black dark:decoration-white">
						{created_by ? (
							<Link href={`/appprofile/${created_by}`}>
								{bloggers?.name}
							</Link>
						) : (
							<span>{bloggers?.name}</span>
						)}
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
}
