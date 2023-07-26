import {
	onBlockQuote,
	onBold,
	onCanvas,
	onCodeBlock,
	onCodeWord,
	onImage,
	onItalic,
	onLatex,
	onLink,
	onOrdererdList,
	onSandbox,
	onSelect,
	onUnordererdList,
} from "@/utils/editorToolFunctions";
import { StateEffect } from "@codemirror/state";
import { memo, useContext, useEffect, useState } from "react";
import { FaBold, FaItalic } from "react-icons/fa";
import { GoListOrdered, GoListUnordered } from "react-icons/go";
import { SiVim } from "react-icons/si";

import { EditorContext } from "@/app/write/components/EditorContext";
import { Compartment } from "@codemirror/state";
import { vim } from "@replit/codemirror-vim";
import { usePathname } from "next/navigation";
import useToggleVim from "@/hooks/useToggleVim";

// const compartment = new Compartment();

function EditorHelperComponent() {
	const { editorState } = useContext(EditorContext);
	const { editorView } = editorState;
	const pathname = usePathname();
	const { toggleVim, vimEnabled } = useToggleVim({ editorView });
	// const [vimCompartment, setVimCompartment] = useState<Compartment>();
	// const [vimEnabled, setVimEnabled] = useState(false);

	// useEffect(() => {
	// 	if (!vimCompartment) {
	// 		const compartment = new Compartment();
	// 		setVimCompartment(compartment);
	// 	}
	// }, []);

	// const onToggleVim = () => {
	// 	if (!editorState.editorView) return;

	// 	if (!vimEnabled) {
	// 		editorState.editorView.dispatch({
	// 			effects: StateEffect.appendConfig.of(vimCompartment!.of(vim())),
	// 			// editorState.editorView.state.facet()
	// 		});
	// 	}
	// 	// C
	// 	if (vimEnabled) {
	// 		editorState.editorView.dispatch({
	// 			effects: vimCompartment?.reconfigure([]),
	// 		});
	// 		//we need to set a new compartment for next time someone enables vim
	// 		const compartment = new Compartment();
	// 		setVimCompartment(compartment);
	// 	}
	// 	setVimEnabled((prev) => !prev);
	// };

	return (
		<div className="flex w-full justify-start md:justify-center gap-2 pb-1 flex-wrap">
			<button
				className="tool"
				onClick={() => {
					if (editorView) onBold(editorView);
				}}
			>
				<FaBold />
			</button>
			<button
				className="btn btn-xs tool"
				onClick={() => {
					if (editorView) onItalic(editorView);
				}}
			>
				<FaItalic />
			</button>
			<select
				value="Heading"
				className="select select-xs tool focus:outline-none"
				onChange={(e) => {
					if (editorView) onSelect(editorView, e.target.value);
				}}
			>
				<option disabled value={"Heading"}>
					Heading
				</option>
				<option value="heading2">heading 2</option>
				<option value="heading3">heading 3</option>
				<option value="heading4">heading 4</option>
				<option value="heading5">heading 5</option>
				<option value="heading6">heading 6</option>
			</select>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onCodeWord(editorView);
				}}
			>
				Code word
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onCodeBlock(editorView);
				}}
			>
				Code block
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onImage(editorView);
				}}
			>
				Image
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onOrdererdList(editorView);
				}}
			>
				{/* <AiOutlineOrderedList size={20} /> */}
				<GoListOrdered size={20} />
				{/* O.L */}
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onUnordererdList(editorView);
				}}
			>
				{/* <AiOutlineUnorderedList size={20} /> */}
				<GoListUnordered size={20} />
				{/* U.L */}
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onBlockQuote(editorView);
				}}
			>
				BlockQuote
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onLink(editorView);
				}}
			>
				Link
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onLatex(editorView);
				}}
			>
				LaTeX
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onCanvas(editorView);
				}}
			>
				Draw
			</button>
			<button
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onSandbox(editorView);
				}}
			>
				Sandbox
			</button>
			<button
				className="btn btn-xs tool gap-2"
				onClick={() => toggleVim()}
			>
				<SiVim
					className={` ${
						vimEnabled ? "text-lime-400" : "text-white"
					}`}
				/>
				<span className="normal-case">
					{vimEnabled ? "Disable" : "Enable"} Vim
				</span>
			</button>
		</div>
	);
}

export default memo(EditorHelperComponent);
