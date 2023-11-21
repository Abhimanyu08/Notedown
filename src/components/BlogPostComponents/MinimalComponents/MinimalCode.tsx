/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {
	MouseEventHandler,
	memo,
	useContext,
	useEffect,
	useState,
} from "react";

import useEditor from "@/hooks/useEditor";
import useToggleVim from "@/hooks/useToggleVim";
import { StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import {
	CodeBlock,
	CodeBlockButton,
	CodeBlockButtons,
} from "@components/EditorComponents/GenericCodeBlock";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import {
	ChevronRightSquare,
	Eraser,
	Pen,
	Terminal as TerminalIcon,
	Undo2,
} from "lucide-react";
import { DiVim } from "react-icons/di";
import useTerminal from "../Terminal";

interface MinimalCodeProps {
	code: string;
	blockNumber: number;
	//These start and end number are the start and end positions of this code block in markdown
	language: string;
	file?: string;
	theme?: string;
}

function MinimalCode({
	code,
	blockNumber,
	file = "main",
	theme,
	language,
}: MinimalCodeProps) {
	const { blogState, dispatch } = useContext(BlogContext);

	const [openShell, setOpenShell] = useState(false);

	const { editorView } = useEditor({
		language: language!,
		code,
		editorParentId: `codearea-${blockNumber}`,
		theme,
	});
	const { toggleVim, vimEnabled: vimEnabledLocally } = useToggleVim({
		editorView,
	});

	const terminal = useTerminal({ blockNumber });

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

		return () => {
			dispatch({ type: "remove editor", payload: blockNumber });
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [blockNumber, editorView]);

	useEffect(() => {
		dispatch({
			type: "set block to filename",
			payload: { [blockNumber]: file || "main" },
		});
	}, [file]);

	useEffect(() => {
		if (!editorView) return;
		if (blogState.vimEnabled !== vimEnabledLocally) toggleVim();
	}, [blogState.vimEnabled, editorView]);

	const onUndo: MouseEventHandler = () => {
		const docLength = editorView?.state.doc.length;

		editorView?.dispatch({
			changes: { from: 0, to: docLength, insert: code },
		});
	};

	const onRunCode = () => {
		setOpenShell(true);
		dispatch({
			type: "set running block",
			payload: blockNumber,
		});
	};

	const onWriteCode = () => {
		dispatch({
			type: "set writing block",
			payload: blockNumber,
		});
	};

	return (
		<CodeBlock className="mt-2">
			{editorView && (
				<CodeBlockButtons
					file={file || "main"}
					language={language || ""}
					themeClasses={editorView?.themeClasses}
				>
					<CodeBlockButton
						onClick={onRunCode}
						tip="Run Code (Shift+Enter)"
					>
						<ChevronRightSquare size={16} />
					</CodeBlockButton>
					<CodeBlockButton
						onClick={onWriteCode}
						tip="Write code to file without running"
					>
						<Pen size={15} />
					</CodeBlockButton>
					<CodeBlockButton
						onClick={onUndo}
						tip="back to original code"
					>
						<Undo2 size={16} />
					</CodeBlockButton>
					<CodeBlockButton
						onClick={() => setOpenShell((prev) => !prev)}
						tip={`${openShell ? "Hide Terminal" : "Show Terminal"}`}
					>
						<TerminalIcon size={16} />
					</CodeBlockButton>
					<CodeBlockButton
						tip={vimEnabledLocally ? "Disable Vim" : "Enable Vim"}
						onClick={() => {
							dispatch({ type: "toggle vim", payload: null });
						}}
					>
						<DiVim
							className={`${
								blogState.vimEnabled ? "text-lime-400" : ""
							}`}
							size={16}
						/>
					</CodeBlockButton>
					<CodeBlockButton
						onClick={() => terminal.clear()}
						tip="Clear console"
					>
						<Eraser size={16} />
					</CodeBlockButton>
				</CodeBlockButtons>
			)}
			<div
				className="w-full border-2 border-border rounded-sm  rounded-se-none rounded-ss-none"
				id={`codearea-${blockNumber}`}
				onDoubleClick={() => {
					// if (setRunningBlock) setRunningBlock(blockNumber);
					dispatch({
						type: "set running block",
						payload: blockNumber,
					});
				}}
			>
				<pre>
					<code>{code}</code>
				</pre>
			</div>

			{/* <Terminal {...{ blockNumber, openShell }} /> */}
			{/* ----------------Terminal----------------- */}
			<div
				className={`not-prose border-[1px] border-white/50 rounded-sm z-10  mt-2 bg-black pl-2 pb-1 overflow-y-auto ${
					openShell ? "" : "hidden"
				} `}
				id={`terminal-${blockNumber}`}
				key={`terminal-${blockNumber}`}
			></div>
		</CodeBlock>
	);
}

export default memo(MinimalCode);
