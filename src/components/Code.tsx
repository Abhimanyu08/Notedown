import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage } from "react-icons/md";
import { BlogContext } from "../pages/_app";

import useEditor from "../hooks/useEditor";

interface CodeProps {
	code: string;
	language: string;
	blockNumber: number;
}

function Code({ code, language, blockNumber }: CodeProps) {
	const [hideOutput, setHideOutput] = useState(false);
	const { blockToOutput, setBlockToCode, collectCodeTillBlock } =
		useContext(BlogContext);

	const { editorView } = useEditor({ language, blockNumber, code });

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
			<div className="w-full " id={`${blockNumber}`}></div>

			<div className="flex flex-row absolute right-2 text-cyan-400 m-1 gap-1">
				<button
					onClick={() => {
						if (!collectCodeTillBlock) return;
						collectCodeTillBlock(blockNumber);
					}}
					className="tooltip  tooltip-left"
					data-tip="Run Code (Shift+Enter)"
					id={`run-${blockNumber}`}
				>
					<BsPlayFill />
				</button>
				<button
					onClick={onUndo}
					className="tooltip  tooltip-left"
					data-tip="back to original code"
				>
					<FcUndo />
				</button>
				<button
					onClick={() => setHideOutput((prev) => !prev)}
					className="tooltip  tooltip-left"
					data-tip="Hide Output"
				>
					<MdHideImage />
				</button>
			</div>
			{blockToOutput && blockToOutput[blockNumber] && (
				<div className="not-prose">
					<pre
						className={`text-white  mt-2 p-4 rounded-md bg-black ${
							hideOutput ? "hidden" : ""
						}`}
					>
						<code className="">
							{blockToOutput[blockNumber].trim()}
						</code>
					</pre>
				</div>
			)}
		</div>
	);
}

export default Code;
