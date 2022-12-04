import React, { Dispatch, SetStateAction } from "react";
import { FaBold, FaItalic } from "react-icons/fa";
import { GoListOrdered, GoListUnordered } from "react-icons/go";
import { SiVim } from "react-icons/si";
import {
	onBold,
	onItalic,
	onSelect,
	onCodeWord,
	onCodeBlock,
	onImage,
	onOrdererdList,
	onUnordererdList,
	onBlockQuote,
	onLink,
	onLatex,
	onCanvas,
} from "../../utils/editorToolFunctions";

import { EditorView } from "codemirror";

interface EditorHelperProps {
	editorView: EditorView | null;
	enabledVimForMarkdown: boolean;
	setEnabledVimForMarkdown: Dispatch<SetStateAction<boolean>>;
}

function EditorHelperComponent({
	editorView,
	enabledVimForMarkdown,
	setEnabledVimForMarkdown,
}: EditorHelperProps) {
	return (
		<div className="flex w-full justify-start md:justify-center gap-1 pb-1 flex-wrap ">
			<div
				className="btn btn-xs tool"
				onClick={() => {
					if (editorView) onBold(editorView);
				}}
			>
				<FaBold />
			</div>
			<div
				className="btn btn-xs tool"
				onClick={() => {
					if (editorView) onItalic(editorView);
				}}
			>
				<FaItalic />
			</div>
			<select
				className="select select-xs tool focus:outline-none"
				onChange={(e) => {
					if (editorView) onSelect(editorView, e.target.value);
				}}
			>
				<option disabled selected>
					Heading
				</option>
				<option value="heading2">heading 2</option>
				<option value="heading3">heading 3</option>
				<option value="heading4">heading 4</option>
				<option value="heading5">heading 5</option>
				<option value="heading6">heading 6</option>
			</select>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onCodeWord(editorView);
				}}
			>
				Code word
			</div>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onCodeBlock(editorView);
				}}
			>
				Code block
			</div>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onImage(editorView);
				}}
			>
				Image
			</div>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onOrdererdList(editorView);
				}}
			>
				{/* <AiOutlineOrderedList size={20} /> */}
				<GoListOrdered size={20} />
				{/* O.L */}
			</div>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onUnordererdList(editorView);
				}}
			>
				{/* <AiOutlineUnorderedList size={20} /> */}
				<GoListUnordered size={20} />
				{/* U.L */}
			</div>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onBlockQuote(editorView);
				}}
			>
				BlockQuote
			</div>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onLink(editorView);
				}}
			>
				Link
			</div>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onLatex(editorView);
				}}
			>
				LaTeX
			</div>
			<div
				className="btn btn-xs normal-case tool"
				onClick={() => {
					if (editorView) onCanvas(editorView);
				}}
			>
				Canvas
			</div>
			<div
				className="btn btn-xs tool gap-2"
				onClick={() => setEnabledVimForMarkdown((prev) => !prev)}
			>
				<SiVim
					className={` ${
						enabledVimForMarkdown ? "text-lime-400" : "text-white"
					}`}
				/>
				<span className="normal-case">
					{enabledVimForMarkdown ? "Disable" : "Enable"} Vim
				</span>
			</div>
		</div>
	);
}

export default EditorHelperComponent;
