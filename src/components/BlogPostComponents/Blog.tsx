import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SUPABASE_BLOGGER_TABLE } from "../../../utils/constants";
import { getImages } from "../../../utils/sendRequest";
import htmlToJsx from "../../../utils/htmlToJsx";
import { sendRequestToRceServer } from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import Blogger from "../../interfaces/Blogger";
import { BlogProps } from "../../interfaces/BlogProps";
import { BlogContext } from "../../pages/_app";
import useLexica from "../../hooks/useLexica";

export function Blog({
	title,
	description,
	content,
	language,
	containerId,
	created_by,
	image_folder,
	bloggers,
	imageToUrl,
	paddingClasses,
}: Partial<BlogProps>) {
	const [collectCodeTillBlock, setCollectCodeTillBlock] =
		useState<(blockNumber: number) => void>();
	const [blockToOutput, setBlockToOutput] = useState<Record<number, string>>(
		{}
	);
	const [vimEnabled, setVimEnabled] = useState(false);
	const [blockToCode, setBlockToCode] = useState<Record<number, string>>({});
	const [runningCode, setRunningCode] = useState(false);
	const [runningBlock, setRunningBlock] = useState<number>();

	const [author, setAuthor] = useState<string>();

	useLexica({ content });

	const blogJsx = useMemo(() => {
		if (!content) return <></>;
		console.log(content);
		return htmlToJsx({
			html: content,
			language: language || "python",
			imageFolder: image_folder || undefined,
			imageToUrl,
		});
	}, [content, language]);

	useEffect(() => {
		if (!containerId) return;
		const func = (blockNumber: number) => {
			setBlockToCode({});
			const event = new Event("focus");
			for (let i = 0; i <= blockNumber; i++) {
				const elem = document.getElementById(
					`run-${i}`
				) as HTMLButtonElement | null;
				if (!elem) continue;
				elem.dispatchEvent(event);
			}
			setRunningBlock(blockNumber);
			setRunningCode(true);
		};
		setCollectCodeTillBlock(() => func);
	}, [containerId]);

	useEffect(() => {
		const fetchAuthor = async (created_by: string) => {
			//fetching author here because author may have changed his displayname
			// and I will blow my head off before attempting to revalidate each one of his single posts
			//just because that maniac changed his username from josh to joshua

			const { data } = await supabase
				.from<Blogger>(SUPABASE_BLOGGER_TABLE)
				.select("name")
				.eq("id", created_by || "");
			if (data) setAuthor(data.at(0)?.name || undefined);
		};
		if (created_by) fetchAuthor(created_by);
	}, [created_by]);

	const runCodeRequest = async (
		blockNumber: number,
		blockToCode: Record<number, string>
	) => {
		let code = Object.values(blockToCode).join("\n");
		code = code.trim();

		let sessionCodeToOutput = sessionStorage.getItem(code);
		if (sessionCodeToOutput) {
			setBlockToOutput({ [blockNumber]: sessionCodeToOutput });
			setBlockToCode({});
			return;
		}
		const params: Parameters<typeof sendRequestToRceServer> = [
			"POST",
			{ language, containerId, code },
		];
		const resp = await sendRequestToRceServer(...params);

		if (resp.status !== 201) {
			setBlockToOutput({ [blockNumber]: resp.statusText });
			return;
		}
		const { output } = (await resp.json()) as { output: string };
		// try {
		// 	sessionStorage.setItem(code, output);
		// } catch {}

		setBlockToOutput({ [blockNumber]: output });
		setBlockToCode({});
	};

	useEffect(() => {
		if (
			!runningCode ||
			runningBlock === undefined ||
			!language ||
			!containerId
		) {
			setRunningBlock(undefined);
			setRunningCode(false);
			return;
		}
		runCodeRequest(runningBlock, blockToCode).then(() => {
			setRunningBlock(undefined);
			setRunningCode(false);
		});
	}, [runningCode]);

	return (
		<BlogContext.Provider
			value={{
				containerId,
				blockToOutput,
				setBlockToCode,
				collectCodeTillBlock,
				setBlockToOutput,
				vimEnabled,
				setVimEnabled,
			}}
		>
			<div
				className={`scroll-smooth prose prose-sm md:prose-lg max-w-none ${paddingClasses}  
				  prose-pre:m-0 prose-pre:p-0  prose-blockquote:text-white h-full 
				overflow-x-hidden		
				overflow-y-auto

				//-------------prose-headings------------
prose-headings:text-purple-700
dark:prose-headings:text-amber-400
				// ---------prose-p--------------
				prose-p:text-left
				prose-p:font-sans
				prose-p:tracking-wide
				prose-p:text-black
				dark:prose-p:text-gray-100

				// -------------prose-li--------
				marker:prose-li:text-purple-700
				dark:marker:prose-li:text-amber-400
				prose-li:text-black
				prose-li:font-sans
				prose-li:tracking-wide
				dark:prose-li:text-gray-100

				// -----------prose-string-----------
				prose-strong:font-extrabold
				prose-strong:text-black
				dark:prose-strong:text-white
				prose-strong:tracking-wide

				//-----------------prose-a-------------
			prose-a:text-blue-700 
			prose-a:font-bold
			dark:prose-a:text-cyan-500
				
			prose-em:tracking-wide

			// ---------------prose-code---------------
			dark:prose-code:bg-amber-300
			dark:prose-code:text-black
			prose-code:bg-black
			prose-code:text-amber-300
			prose-code:px-2 
			prose-code:font-mono
			md:prose-code:text-sm 
				prose-code:rounded-md
				prose-code:select-all


				prose-figcaption:text-black
				dark:prose-figcaption:text-gray-200

prose-blockquote:border-l-black prose-blockquote:border-l-4
dark:prose-blockquote:border-l-amber-300
				  prose-h1:mb-6  md:prose-p:text-lg md:prose-ul:text-lg 
				md:prose-ol:text-lg 
				
				pb-20 md:pb-10 
			prose-a:after:content-['_↗']	
			prose-a:after:mr-1
lg:scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-700
				`}
			>
				<h1 className="text-center" id="title">
					{title}
				</h1>
				<div className="text-center italic text-lg md:text-xl w-full font-semibold text-black dark:text-gray-100">
					{description}
				</div>
				<div className="dark:text-gray-100 flex gap-1 not-prose text-xs md:text-sm text-black justify-center mb-10 md:mb-12 mt-8 font-mono">
					<span>by</span>
					<span className="link underline-offset-2 decoration-purple-400 dark:decoration-amber-200">
						{created_by ? (
							<Link href={`/profile/${created_by}`}>
								{author || bloggers?.name || ""}
							</Link>
						) : (
							<span>{bloggers?.name}</span>
						)}
					</span>
				</div>
				<div className="" id="jsx">
					{blogJsx}
				</div>
			</div>
		</BlogContext.Provider>
	);
}
