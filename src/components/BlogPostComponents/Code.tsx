"use client";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { BsPencilFill, BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage, MdImage } from "react-icons/md";
import { SiVim } from "react-icons/si";

import useEditor from "../../hooks/useEditor";
import { BlogProps } from "../../interfaces/BlogProps";

import { StateEffect } from "@codemirror/state";
import { vim } from "@replit/codemirror-vim";
import useTerminal from "../../hooks/useTerminal";
import { BlogContext } from "app/apppost/BlogState";
import getExtensions from "@utils/getExtensions";
interface CodeProps {
	code: string;
	language: BlogProps["language"];
	blockNumber: number;
}

function Code({ code, language, blockNumber }: CodeProps) {
	// const {
	// 	containerId,
	// 	vimEnabled,
	// 	setVimEnabled,
	// 	setRunningBlock,
	// 	setBlockToEditor,
	// 	setWritingBlock,
	// } = useContext(BlogContext);
	const { blogState, dispatch } = useContext(BlogContext);

	const [mounted, setMounted] = useState(false);
	const [openShell, setOpenShell] = useState(true);
	const { editorView } = useEditor({
		language,
		blockNumber,
		code,
		mounted,
		editorParentId: `codearea-${blockNumber}`,
	});

	useTerminal({
		containerId: blogState.containerId,
		blockNumber,
		mounted,
	});

	useEffect(() => {
		if (!mounted) setMounted(true);
	}, [mounted]);

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
		<div className="flex relative flex-col w-full ">
			<div className="flex flex-row  gap-5 w-fit self-end bg-black py-1 px-3 rounded-t-md">
				{mounted && (
					<>
						<button
							onClick={() => {
								// setRunningBlock(blockNumber);
								dispatch({
									type: "set running block",
									payload: blockNumber,
								});
							}}
							className="md:tooltip"
							data-tip="Run Code (Shift+Enter)"
							id={`run-${blockNumber}`}
						>
							<BsPlayFill
								className={`text-cyan-400 ${
									false ? "animate-pulse" : ""
								}`}
								size={16}
							/>
						</button>
						<button
							onClick={() => {
								dispatch({
									type: "set writing block",
									payload: blockNumber,
								});
							}}
							className="md:tooltip"
							data-tip="Write code to file without running"
						>
							<BsPencilFill size={14} className="text-cyan-400" />
						</button>
					</>
				)}
				<button
					onClick={onUndo}
					className="md:tooltip "
					data-tip="back to original code"
				>
					<FcUndo className="text-cyan-400" />
				</button>
				<button
					onClick={() => setOpenShell((prev) => !prev)}
					className="md:tooltip  "
					data-tip={`${
						openShell ? "Hide Terminal" : "Show Terminal"
					}`}
				>
					{openShell ? (
						<MdImage className="text-cyan-400" />
					) : (
						<MdHideImage className="text-cyan-400" />
					)}
				</button>
				<button
					className="md:tooltip hidden lg:block mr-1"
					data-tip="Enable Vim"
					onClick={() => {
						// if (setVimEnabled) setVimEnabled((prev) => !prev);
						dispatch({ type: "toggle vim", payload: {} });
					}}
				>
					<SiVim
						className={`${
							blogState.vimEnabled
								? "text-lime-400"
								: "text-cyan-400"
						}`}
						size={14}
					/>
				</button>
			</div>
			{mounted && (
				<div
					className="w-full"
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

			{mounted && (
				<div
					className={`not-prose  mt-2 bg-black pl-2 pb-1 overflow-y-auto ${
						openShell ? "" : "hidden"
					}`}
					id={`terminal-${blockNumber}`}
				></div>
			)}
		</div>
	);
}

export default Code;
