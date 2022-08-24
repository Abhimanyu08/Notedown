import React, {
	MouseEventHandler,
	useContext,
	useEffect,
	useState,
} from "react";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage } from "react-icons/md";
import { BlogContext } from "../pages/_app";

import { EditorState, Compartment } from "@codemirror/state";
import { basicSetup, minimalSetup, EditorView } from "codemirror";
import { python } from "@codemirror/lang-python";
import { prepareServerlessUrl } from "next/dist/server/base-server";

interface CodeProps {
	text: string;
	language: string;
	containerId: string;
	blockNumber: number;
}

function Code({ text, language, containerId, blockNumber }: CodeProps) {
	const [codeSubmitted, setCodeSubmitted] = useState(true);
	const [hideOutput, setHideOutput] = useState(false);
	const { blockToOutput, setBlockToCode, collectCodeTillBlock } =
		useContext(BlogContext);
	const [editorView, setEditorView] = useState<EditorView | null>(null);

	useEffect(() => {
		if (editorView) return;
		let languageCompartment = new Compartment();
		let tabSize = new Compartment();
		let startState = EditorState.create({
			doc: text,
			extensions: [
				basicSetup,
				languageCompartment.of(python()),
				tabSize.of(EditorState.tabSize.of(4)),
			],
		});

		let view = new EditorView({
			state: startState,
			parent: document.getElementById(`${blockNumber}`)!,
		});

		setEditorView(view);
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
			setBlockToCode((prev) => ({
				...prev,
				[blockNumber]: code,
			}));
		};
	}, [blockNumber, editorView]);

	const onUndo: MouseEventHandler = () => {
		const docLength = editorView?.state.doc.length;
		editorView?.dispatch({
			changes: { from: 0, to: docLength, insert: text },
		});
	};
	return (
		<div className="flex relative flex-col w-full ">
			<div className="w-full bg-black" id={`${blockNumber}`}></div>

			<div className="flex flex-row absolute right-2 text-cyan-400 m-1 gap-1">
				<button
					onClick={() => {
						if (!collectCodeTillBlock) return;
						collectCodeTillBlock(blockNumber);
					}}
					className="tooltip  tooltip-left"
					data-tip="Run Code"
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
				<div
					className={` text-white bg-black p-2 mt-2 rounded-md ${
						hideOutput ? "hidden" : ""
					}`}
				>
					{blockToOutput[blockNumber]}
				</div>
			)}
		</div>
	);
}

export default Code;
