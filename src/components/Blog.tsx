import { useEffect, useMemo, useState } from "react";
import htmlToJsx from "../../utils/htmlToJsx";
import sendRequest from "../../utils/sendRequest";
import { BlogProps } from "../interfaces/BlogProps";
import { BlogContext } from "../pages/_app";

export function Blog({
	title,
	description,
	content,
	language,
}: Partial<BlogProps>) {
	const [containerId, setContainerId] = useState<string | null>(null);
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
		});
	}, [content]);

	// useEffect(() => {
	// 	const prepareContainer = async (language: string) => {
	// 		const resp = await sendRequest("POST", {
	// 			language,
	// 		});

	// 		if (resp.status !== 201) {
	// 			console.log(resp.statusText);
	// 			return;
	// 		}
	// 		const body: { containerId: string } = await resp.json();
	// 		setContainerId(body.containerId);
	// 	};
	// 	if (!containerId && language) prepareContainer(language);
	// }, []);

	useEffect(() => {
		const func = (blockNumber: number) => {
			const event = new Event("focus");
			for (let i = 1; i < blockNumber; i++) {
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
				className={` prose  max-w-none basis-3/5 lg:px-40 prose-headings:text-amber-500 prose-p:font-medium prose-p:text-lg prose-p:text-justify text-white prose-a:text-lime-400
				prose-strong:text-violet-500 prose-pre:m-0 prose-pre:p-0 prose-li:text-lg prose-blockquote:text-amber-300 prose-p:font-sans overflow-scroll h-screen pb-20 
				
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
