import React, { useContext, useEffect, useState } from "react";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage } from "react-icons/md";
import { BlogContext } from "../pages/_app";

import { EditorState, Compartment } from "@codemirror/state";
import { basicSetup, minimalSetup, EditorView } from "codemirror";
import { python } from "@codemirror/lang-python";

interface CodeProps {
	text: string;
	language: string;
	containerId: string;
	blockNumber: number;
	runTillThisPoint: ((blockNumber: number) => void) | null;
}

function Code({
	text,
	language,
	containerId,
	blockNumber,
	runTillThisPoint,
}: CodeProps) {
	const [code, setCode] = useState(text);
	const [hideOutput, setHideOutput] = useState(false);
	const blockToOutput = useContext(BlogContext);
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
	const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
		e.preventDefault();
		setCode(e.target.value);
	};

	const onBackToOriginal: React.MouseEventHandler<HTMLButtonElement> = (
		e
	) => {
		e.preventDefault();
		setCode(text);
	};
	return (
		<div className="flex relative flex-col w-full ">
			<div className="w-full bg-black" id={`${blockNumber}`}></div>

			<div className="flex flex-row absolute right-2 text-cyan-400 m-1 gap-1">
				<button
					onClick={() => {
						if (runTillThisPoint) runTillThisPoint(blockNumber);
					}}
					className=""
				>
					<BsPlayFill />
				</button>
				<button onClick={onBackToOriginal} className="">
					<FcUndo />
				</button>
				<button onClick={() => setHideOutput((prev) => !prev)}>
					<MdHideImage />
				</button>
			</div>
			{blockToOutput[blockNumber] && (
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
