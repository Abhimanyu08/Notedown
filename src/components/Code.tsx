import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage } from "react-icons/md";
import { BlogContext } from "../pages/_app";

import useEditor from "../hooks/useEditor";
import { BlogProps } from "../interfaces/BlogProps";

interface CodeProps {
	code: string;
	language: BlogProps["language"] | "markdown";
	blockNumber: number;
}

function Code({ code, language, blockNumber }: CodeProps) {
	const [hideOutput, setHideOutput] = useState(false);
	const { blockToOutput, setBlockToCode, collectCodeTillBlock } =
		useContext(BlogContext);

	const { editorView } = useEditor({ language, blockNumber, code });
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const playButton = document.getElementById(
			`run-${blockNumber}`
		) as HTMLButtonElement | null;
		if (!playButton) return;

		playButton.onfocus = (e) => {
			e.preventDefault();

			if (!setBlockToCode) return;
			const codeArray = editorView?.state.doc.toJSON() || [""];
			const code = codeArray.join("\n");
			if (/file-((.)+)/.exec(codeArray[0])) {
				setBlockToCode({
					[blockNumber]: code,
				});
				return;
			}
			setBlockToCode((prev) => ({
				...prev,
				[blockNumber]: code,
			}));
		};
	}, [blockNumber, editorView]);

	const onUndo: MouseEventHandler = () => {
		const docLength = editorView?.state.doc.length;
		editorView?.dispatch({
			changes: { from: 0, to: docLength, insert: code },
		});
	};
	return (
		<div className="flex relative flex-col w-full ">
			{mounted && (
				<div className="w-full " id={`codearea-${blockNumber}`}></div>
			)}
			<div className="flex flex-row absolute right-2 m-1 gap-2">
				<button
					onClick={() => {
						if (!collectCodeTillBlock) return;
						collectCodeTillBlock(blockNumber);
					}}
					className="md:tooltip  md:tooltip-left"
					data-tip="Run Code (Shift+Enter)"
					id={`run-${blockNumber}`}
				>
					<BsPlayFill className="text-cyan-400" />
				</button>
				<button
					onClick={onUndo}
					className="md:tooltip  md:tooltip-left"
					data-tip="back to original code"
				>
					<FcUndo className="text-cyan-400" />
				</button>
				<button
					onClick={() => setHideOutput((prev) => !prev)}
					className="md:tooltip  md:tooltip-left"
					data-tip="Hide Output"
				>
					<MdHideImage className="text-cyan-400" />
				</button>
			</div>
			{blockToOutput && blockToOutput[blockNumber] && (
				<div className="not-prose">
					<pre
						className={`text-white overflow-x-auto mt-2 p-4 rounded-md bg-black ${
							hideOutput ? "hidden" : ""
						}`}
					>
						<code className="max-w-full">
							{blockToOutput[blockNumber].trim()}
						</code>
					</pre>
				</div>
			)}
		</div>
	);
}

export default Code;
