"use client";
import { Compartment } from "@codemirror/state";
import {
	MouseEventHandler,
	memo,
	useContext,
	useEffect,
	useState,
} from "react";
import { BsPencilFill, BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage, MdImage } from "react-icons/md";
import { SiVim } from "react-icons/si";

import useEditor from "../../hooks/useEditor";

import { EditorContext } from "@/app/write/components/EditorContext";
import { StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { ToolTipComponent } from "@components/ToolTipComponent";
import Button from "@components/ui/button";
import { vim } from "@replit/codemirror-vim";
import { usePathname } from "next/navigation";
import path from "path";
import Terminal from "./Terminal";
import { AiOutlineSync } from "react-icons/ai";
import {
	CodeBlock,
	CodeBlockButton,
	CodeBlockButtons,
} from "@components/EditorComponents/GenericCodeBlock";
import useToggleVim from "@/hooks/useToggleVim";
interface CodeProps {
	code: string;
	blockNumber: number;
	//These start and end number are the start and end positions of this code block in markdown
	start?: number;
	end?: number;
}

function Code({ code, blockNumber, start, end }: CodeProps) {
	// const {
	// 	containerId,
	// 	vimEnabled,
	// 	setVimEnabled,
	// 	setRunningBlock,
	// 	setBlockToEditor,
	// 	setWritingBlock,
	// } = useContext(BlogContext);
	const { blogState, dispatch } = useContext(BlogContext);
	const markdownEditorContext = useContext(EditorContext);
	const { language } = blogState.blogMeta;

	const [openShell, setOpenShell] = useState(false);
	const pathname = usePathname();

	const { editorView } = useEditor({
		language: language!,
		code,
		editorParentId: `codearea-${blockNumber}`,
	});
	const { toggleVim, vimEnabled: vimEnabledLocally } = useToggleVim({
		editorView,
	});

	useEffect(() => {
		if (!editorView) return;
		editorView.dispatch({
			effects: StateEffect.appendConfig.of([
				keymap.of([
					{
						key: "Shift-Enter",
						run() {
							setOpenShell(true);
							dispatch({
								type: "set running block",
								payload: blockNumber,
							});
							return true;
						},
					},
				]),
			]),
		});

		dispatch({
			type: "set editor",
			payload: {
				[blockNumber]: editorView,
			},
		});
	}, [blockNumber, editorView]);

	const onUndo: MouseEventHandler = () => {
		const docLength = editorView?.state.doc.length;

		editorView?.dispatch({
			changes: { from: 0, to: docLength, insert: code },
		});
	};

	useEffect(() => {
		toggleVim();
	}, [blogState.vimEnabled]);

	const onSync = () => {
		if (!markdownEditorContext || !editorView) return;
		const { editorState } = markdownEditorContext;
		const { editorView: markdownEditorView, frontMatterLength } =
			editorState;
		const newCode = editorView.state.sliceDoc().trim();
		if (!start || !end) {
			console.log("no start or end");
			return;
		}
		markdownEditorView?.dispatch({
			changes: [
				{
					from: start + frontMatterLength + 4,
					to: end + frontMatterLength - 3,
					insert: newCode + "\n",
				},
			],
		});
	};

	return (
		<CodeBlock>
			<CodeBlockButtons>
				<CodeBlockButton
					onClick={() => {
						// setRunningBlock(blockNumber);
						setOpenShell(true);
						dispatch({
							type: "set running block",
							payload: blockNumber,
						});
					}}
					tip="Run Code (Shift+Enter)"
				>
					<BsPlayFill size={16} />
				</CodeBlockButton>
				<CodeBlockButton
					onClick={() => {
						// setRunningBlock(blockNumber);
						setOpenShell(true);
						dispatch({
							type: "set writing block",
							payload: blockNumber,
						});
					}}
					tip="Write code to file without running"
				>
					<BsPencilFill size={11} />
				</CodeBlockButton>
				{pathname?.startsWith("/write") && (
					<CodeBlockButton
						onClick={() => onSync()}
						className="md:tooltip"
						tip="Sync code to markdown"
					>
						<AiOutlineSync size={14} />
					</CodeBlockButton>
				)}
				<CodeBlockButton onClick={onUndo} tip="back to original code">
					<FcUndo className="text-cyan-400" />
				</CodeBlockButton>
				<CodeBlockButton
					onClick={() => setOpenShell((prev) => !prev)}
					tip={`${openShell ? "Hide Terminal" : "Show Terminal"}`}
				>
					{openShell ? (
						<MdImage className="text-cyan-400" />
					) : (
						<MdHideImage className="text-cyan-400" />
					)}
				</CodeBlockButton>
				<CodeBlockButton
					tip={vimEnabledLocally ? "Disable Vim" : "Enable Vim"}
					onClick={() => {
						dispatch({ type: "toggle vim", payload: null });
					}}
				>
					<SiVim
						className={`${
							blogState.vimEnabled ? "text-lime-400" : ""
						}`}
						size={14}
					/>
				</CodeBlockButton>
			</CodeBlockButtons>
			<div
				className="w-full border-[1px] border-white/50 rounded-sm"
				id={`codearea-${blockNumber}`}
				onDoubleClick={() => {
					// if (setRunningBlock) setRunningBlock(blockNumber);
					dispatch({
						type: "set running block",
						payload: blockNumber,
					});
				}}
			></div>

			<Terminal {...{ blockNumber, openShell }} />
		</CodeBlock>
	);
}

export default memo(Code);
