"use client";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { BsPencilFill, BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage, MdImage } from "react-icons/md";
import { SiVim } from "react-icons/si";

import useEditor from "../../hooks/useEditor";

import { BlogContext } from "@/app/apppost/components/BlogState";
import { StateEffect } from "@codemirror/state";
import { vim } from "@replit/codemirror-vim";
import getExtensions from "@utils/getExtensions";
import Terminal from "./Terminal";
interface CodeProps {
	code: string;
	blockNumber: number;
}

function Code({ code, blockNumber }: CodeProps) {
	// const {
	// 	containerId,
	// 	vimEnabled,
	// 	setVimEnabled,
	// 	setRunningBlock,
	// 	setBlockToEditor,
	// 	setWritingBlock,
	// } = useContext(BlogContext);
	const { blogState, dispatch } = useContext(BlogContext);
	const { language } = blogState.blogMeta;

	const [mounted, setMounted] = useState(false);
	const [openShell, setOpenShell] = useState(true);
	const { editorView } = useEditor({
		language,
		blockNumber,
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
		// if (setBlockToEditor && editorView)
		// 	setBlockToEditor((prev) => ({
		// 		...prev,
		// 		[blockNumber]: editorView,
		// 	}));
		if (typeof window === "undefined") console.log("running on server");
		if (!editorView) return;
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
		if (!editorView) return;
		if (blogState.vimEnabled) {
			editorView.dispatch({
				effects: StateEffect.reconfigure.of([
					vim(),
					...getExtensions({
						language,
						blockNumber,
						setRunningBlock: (blockNumber) =>
							dispatch({
								type: "set running block",
								payload: blockNumber,
							}),
					}),
				]),
			});
		}
		if (!blogState.vimEnabled) {
			editorView.dispatch({
				effects: StateEffect.reconfigure.of(
					getExtensions({
						language,
						blockNumber,
						setRunningBlock: (blockNumber) =>
							dispatch({
								type: "set running block",
								payload: blockNumber,
							}),
					})
				),
			});
		}
	}, [blogState.vimEnabled]);

	return (
		<div className="flex flex-col w-full ">
			<div className="flex flex-row  gap-5 w-fit self-end border-[1px] border-b-0 border-white/50 bg-black py-1 px-3 rounded-t-md">
				{mounted && (
					<>
						<CodeAreaButton
							onClick={() => {
								// setRunningBlock(blockNumber);
								dispatch({
									type: "set running block",
									payload: blockNumber,
								});
							}}
							className="md:tooltip"
							tip="Run Code (Shift+Enter)"
						>
							<BsPlayFill
								className={`text-cyan-400 ${
									false ? "animate-pulse" : ""
								}`}
								size={16}
							/>
						</CodeAreaButton>
						<CodeAreaButton
							onClick={() => {
								dispatch({
									type: "set writing block",
									payload: blockNumber,
								});
							}}
							className="md:tooltip"
							tip="Write code to file without running"
						>
							<BsPencilFill size={12} className="text-cyan-400" />
						</CodeAreaButton>
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
					className="md:tooltip hidden lg:block mr-1"
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
			{mounted && (
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
	tip?: string;
	className?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
	return (
		<button
			className={
				"tooltip tooltip-top text-cyan-400 hover:scale-110 active:scale-90 " +
					className || ""
			}
			onClick={onClick}
			data-tip={tip}
		>
			{children}
		</button>
	);
};

export default Code;
