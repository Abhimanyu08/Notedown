import { useEffect, useMemo, useRef, useState } from "react";
import htmlToJsx from "../../utils/htmlToJsx";
import sendRequest from "../../utils/sendRequest";
import { BlogProps } from "../interfaces/BlogProps";
import { BlogContext } from "../pages/_app";

export function Blog({
	title,
	description,
	content,
	language,
	containerId,
	created_by,
}: Partial<BlogProps>) {
	const [collectCodeTillBlock, setCollectCodeTillBlock] =
		useState<(blockNumber: number) => void>();
	const [blockToOutput, setBlockToOutput] = useState<Record<number, string>>(
		{}
	);
	const [blockToCode, setBlockToCode] = useState<Record<number, string>>({});
	const [runningCode, setRunningCode] = useState(false);
	const [runningBlock, setRunningBlock] = useState<number>();

	const blogJsx = useMemo(() => {
		if (!content) return <></>;
		return htmlToJsx({
			html: content,
			language: language!,
			ownerId: created_by!,
			blogTitle: title!,
		});
	}, []);

	useEffect(() => {
		console.log(content);
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
	}, []);

	useEffect(() => {
		if (!runningCode || !runningBlock || !language || !containerId) return;
		const runCodeRequest = async (blockNumber: number) => {
			let code = Object.values(blockToCode).join("\n");
			code = code.trim();

			let sessionCodeToOutput = sessionStorage.getItem(code);
			if (sessionCodeToOutput) {
				setBlockToOutput({ [blockNumber]: sessionCodeToOutput });
				setBlockToCode({});
				return;
			}
			const params: Parameters<typeof sendRequest> = [
				"POST",
				{ language, containerId, code },
			];
			const resp = await sendRequest(...params);

			if (resp.status !== 201) {
				setBlockToOutput({ [blockNumber]: resp.statusText });
				return;
			}
			const { output } = (await resp.json()) as { output: string };
			try {
				sessionStorage.setItem(code, output);
			} catch {}
			setBlockToOutput({ [blockNumber]: output });
			setBlockToCode({});
		};
		runCodeRequest(runningBlock).then(() => {
			setRunningBlock(undefined);
			setRunningCode(false);
		});
	}, [runningCode]);

	return (
		<BlogContext.Provider
			value={{ blockToOutput, setBlockToCode, collectCodeTillBlock }}
		>
			<div
				className={` prose  max-w-none basis-3/5 lg:px-32 prose-headings:text-amber-500 prose-p:font-normal prose-p:text-lg prose-p:text-justify text-white prose-a:text-lime-400
				prose-strong:text-violet-500 prose-pre:m-0 prose-pre:p-0 prose-li:text-lg prose-blockquote:text-amber-300 prose-p:font-sans h-full overflow-y-auto
				`}
			>
				<h1 className="text-center">{title}</h1>
				<div className="text-center italic text-xl w-full">
					{description}
				</div>
				<div className="">{blogJsx}</div>
			</div>
		</BlogContext.Provider>
	);
}
