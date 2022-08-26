import { useEffect, useMemo, useState } from "react";
import htmlToJsx from "../../utils/htmlToJsx";
import sendRequest from "../../utils/sendRequest";
import { BlogProps } from "../interfaces/PublicBlogProps";
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
				className={`mx-auto prose  max-w-none lg:w-5/6 xl:w-4/6 prose-headings:text-cyan-500 text-white prose-a:text-amber-400 prose-strong:text-amber-500
				prose-pre:m-0 prose-pre:p-0
				`}
			>
				<h1 className="text-center">{title}</h1>
				<p className="text-center italic">{description}</p>
				<div className="">{blogJsx}</div>
			</div>
		</BlogContext.Provider>
	);
}
