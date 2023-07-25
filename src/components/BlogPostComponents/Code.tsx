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

	const [mounted, setMounted] = useState(false);
	const [openShell, setOpenShell] = useState(false);
	const pathname = usePathname();

	const [vimCompartment, setVimCompartment] = useState<Compartment>();
	const { editorView } = useEditor({
		language: language!,
		code,
		mounted,
		editorParentId: `codearea-${blockNumber}`,
	});

	useEffect(() => {
		if (!mounted) setMounted(true);
	}, [mounted]);
	// useTerminal({
	// 	containerId: blogState.containerId,
	// 	blockNumber,
	// 	mounted,
	// });

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
		if (!editorView || !language) return;
		if (blogState.vimEnabled) {
			const compartment = new Compartment();
			setVimCompartment(compartment);
			editorView.dispatch({
				effects: StateEffect.appendConfig.of(compartment!.of(vim())),
				// editorState.editorView.state.facet()
			});
		}
		if (!blogState.vimEnabled) {
			if (!vimCompartment) return;
			editorView.dispatch({
				effects: vimCompartment?.reconfigure([]),
			});
		}
	}, [blogState.vimEnabled, editorView]);

	const onSync = () => {
		if (!markdownEditorContext || !editorView) return;
		const { editorState } = markdownEditorContext;
		const { editorView: markdownEditorView, frontMatterLength } =
			editorState;
		const newCode = editorView.state.sliceDoc();
		if (!start || !end) {
			console.log("no start or end");
			return;
		}
		markdownEditorView?.dispatch({
			changes: [
				{
					from: start + frontMatterLength + 4,
					to: end + frontMatterLength - 4,
					insert: newCode,
				},
			],
		});
	};

	return (
		<div className="flex flex-col w-full ">
			<div className="flex flex-row  gap-5 w-fit self-end border-[1px] border-b-0 border-white/50 bg-[#15181c] py-1 px-3 rounded-t-md">
				{mounted && (
					<>
						<CodeAreaButton
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
						</CodeAreaButton>
						<CodeAreaButton
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
						</CodeAreaButton>
						{pathname?.startsWith("/write") && (
							<CodeAreaButton
								onClick={() => onSync()}
								className="md:tooltip"
								tip="Sync code to markdown"
							>
								<AiOutlineSync size={14} />
							</CodeAreaButton>
						)}
					</>
				)}
				<CodeAreaButton onClick={onUndo} tip="back to original code">
					<FcUndo className="text-cyan-400" />
				</CodeAreaButton>
				<CodeAreaButton
					onClick={() => setOpenShell((prev) => !prev)}
					tip={`${openShell ? "Hide Terminal" : "Show Terminal"}`}
				>
					{openShell ? (
						<MdImage className="text-cyan-400" />
					) : (
						<MdHideImage className="text-cyan-400" />
					)}
				</CodeAreaButton>
				<CodeAreaButton
					className=" hidden lg:block mr-1"
					tip="Enable Vim"
					onClick={() => {
						// if (setVimEnabled) setVimEnabled((prev) => !prev);
						dispatch({ type: "toggle vim", payload: {} });
					}}
				>
					<SiVim
						className={`${
							blogState.vimEnabled ? "text-lime-400" : ""
						}`}
						size={14}
					/>
				</CodeAreaButton>
			</div>
			{mounted ? (
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
			) : (
				<pre>
					<code>{code}</code>
				</pre>
			)}

			{mounted && <Terminal {...{ blockNumber, openShell }} />}
		</div>
	);
}

const CodeAreaButton = ({
	children,
	tip,
	className,
	onClick,
}: {
	children: React.ReactNode;
	tip: string;
	className?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
	return (
		<ToolTipComponent tip={tip} side="top">
			<Button
				className={
					"text-cyan-400 hover:scale-110 active:scale-90 " +
						className || ""
				}
				onClick={onClick}
				data-tip={tip}
			>
				{children}
			</Button>
		</ToolTipComponent>
	);
};

export default memo(Code);
