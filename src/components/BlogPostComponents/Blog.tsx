import { EditorView } from "codemirror";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
	ALLOWED_LANGUAGES,
	langToExtension,
	SUPABASE_BLOGGER_TABLE,
} from "../../../utils/constants";
import htmlToJsx from "../../../utils/htmlToJsx";
import { sendRequestToRceServer } from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import useLexica from "../../hooks/useLexica";
import Blogger from "../../interfaces/Blogger";
import { BlogProps } from "../../interfaces/BlogProps";
import { BlogContext } from "../../pages/_app";
import formatDate from "../../../utils/dateFormatter";

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
	published,
	published_on,
	created_at,
	paddingClasses = "px-2 lg:px-20",
}: Partial<BlogProps>) {
	const [blockToOutput, setBlockToOutput] = useState<Record<number, string>>(
		{}
	);
	const [vimEnabled, setVimEnabled] = useState(false);
	const [blockToEditor, setBlockToEditor] = useState<
		Record<number, EditorView>
	>({});
	const [runningRceRequest, setRunningRceRequest] = useState(false);
	const [runningBlock, setRunningBlock] = useState<number>();
	const [writingBlock, setWritingBlock] = useState<number>();

	const [author, setAuthor] = useState<string>();

	useLexica({ content });

	const blogJsx = useMemo(() => {
		if (!content) return <></>;
		return htmlToJsx({
			html: content,
			language: language,
			imageFolder: image_folder || undefined,
			imageToUrl,
		});
	}, [content, language]);

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

	useEffect(() => {
		if (runningBlock === undefined && writingBlock === undefined) return;
		if (runningRceRequest) {
			setBlockToOutput({
				[(runningBlock || writingBlock) as number]:
					"Previous request is pending, please wait",
			});
			return;
		}
		if (!language || !containerId) {
			if (!containerId) {
				setBlockToOutput({
					[(runningBlock || writingBlock) as number]:
						"Please enable remote code execution",
				});
			}
			setRunningBlock(undefined);
			setWritingBlock(undefined);
			// setRunningCode(false);
			return;
		}

		setRunningRceRequest(true);

		let block: number;
		if (typeof runningBlock === "number") {
			block = runningBlock;
		} else {
			block = writingBlock as number;
		}
		// if the current block contains a file comment at the top then only collect code from blocks which contain the same
		// comment on top of them
		const firstLine = blockToEditor[block].state.doc
			.toJSON()
			.filter((l) => l !== "")
			.at(0);
		const fileName = checkFileName(firstLine || "");
		let codeArray: string[] = [];

		for (let i = 0; i <= block; i++) {
			if (document.getElementById(`codearea-${i}`)) {
				let blockCodeArray = blockToEditor[i].state.doc
					.toJSON()
					.filter((l) => l !== "");
				const firstLineOfBlock = blockCodeArray[0];
				if (!fileName) {
					if (!checkFileName(firstLineOfBlock)) {
						codeArray = codeArray.concat(blockCodeArray);
					}
				} else {
					const blockFileName = checkFileName(firstLineOfBlock);
					if (
						blockFileName === fileName ||
						blockFileName + langToExtension[language] ===
							fileName ||
						blockFileName === fileName + langToExtension[language]
					) {
						codeArray = codeArray.concat(blockCodeArray.slice(1));
					}
				}
			}
		}

		const code = codeArray.join("\n");
		const run = writingBlock === undefined;

		runCodeRequest({ code, run, containerId, fileName, language }).then(
			(val) => {
				setBlockToOutput((prev) => ({ ...prev, [block]: val }));
				setRunningBlock(undefined);
				setWritingBlock(undefined);
				setRunningRceRequest(false);
			}
		);
	}, [runningBlock, writingBlock]);

	return (
		<BlogContext.Provider
			value={{
				containerId,
				blockToOutput,
				setBlockToOutput,
				vimEnabled,
				setVimEnabled,
				setRunningBlock,
				setWritingBlock,
				setBlockToEditor,
			}}
		>
			<div
				className={`
				${paddingClasses}
				scroll-smooth prose prose-sm  max-w-none 
				    prose-blockquote:text-white h-full 
				overflow-x-hidden		
				overflow-y-auto

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
			dark:prose-code:bg-black
			dark:prose-code:text-gray-200
			prose-code:bg-white
			prose-code:text-black
			prose-code:px-2 
			md:prose-code:text-sm 
				prose-code:rounded-md
				prose-code:select-all


				prose-figcaption:text-black
				dark:prose-figcaption:text-gray-200

prose-blockquote:border-l-black prose-blockquote:border-l-4
dark:prose-blockquote:border-l-gray-300
				  prose-h1:mb-6   
				
				pb-20 md:pb-10 
lg:scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-700
				`}
			>
				<header>
					<h1 className="text-left " id="title">
						{title}
					</h1>
					<blockquote className="text-left text-lg w-full font-medium text-black dark:text-font-grey">
						{description}
					</blockquote>
					<div className="dark:text-font-grey flex gap-2 not-prose text-xs md:text-sm text-black justify-start mb-10 md:mb-12 mt-5">
						<span>by</span>
						<span className="link underline-offset-2 decoration-black dark:decoration-white">
							{created_by ? (
								<Link href={`/profile/${created_by}`}>
									{author || bloggers?.name || ""}
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
		</BlogContext.Provider>
	);
}

function checkFileName(firstLine: string): string {
	return /file-(.*)/.exec(firstLine)?.at(1)?.trim() || "";
}
type runCodeParams = {
	code: string;
	run: boolean;
	language: (typeof ALLOWED_LANGUAGES)[number];
	containerId: string;
	fileName?: string;
};

async function runCodeRequest({
	code,
	run,
	language,
	containerId,
	fileName,
}: runCodeParams) {
	let sessionCodeToOutput = sessionStorage.getItem(code);
	if (sessionCodeToOutput) {
		if (!run) return "";
		return sessionCodeToOutput;
	}

	const params: Parameters<typeof sendRequestToRceServer> = [
		"POST",
		{ language, containerId, code, fileName, run },
	];
	const resp = await sendRequestToRceServer(...params);

	if (resp.status !== 201) {
		return resp.statusText;
	}
	const { output } = (await resp.json()) as { output: string };

	try {
		sessionStorage.setItem(code, output);
	} catch {}

	return output;
}
