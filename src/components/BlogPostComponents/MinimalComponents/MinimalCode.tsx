/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Compartment } from "@codemirror/state";
import {
	MouseEventHandler,
	memo,
	useCallback,
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
import { ALLOWED_LANGUAGES, langToFileExtension } from "@utils/constants";
import {
	Check,
	ChevronRightSquare,
	Copy,
	Eraser,
	Pen,
	Terminal as TerminalIcon,
	Undo2,
} from "lucide-react";
import { DiVim } from "react-icons/di";
import useTerminal from "../Terminal";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { cn } from "@/lib/utils";
import prepareContainer from "@utils/prepareContainer";
import { useSupabase } from "@/app/appContext";
import { LoginDialog } from "../LoginDialog";

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
	const [copied, setCopied] = useState(false);
	const { session } = useSupabase();
	const [openLoginDialog, setOpenLoginDialog] = useState(false);
	const [runCodeCompartment, setRunCodeCompartment] = useState<Compartment>();
	const [minimize, setMinimize] = useState(false);
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
		// shortcut to toggle vim mode
		if (!editorView) return;
		const compartment = new Compartment();
		editorView.dispatch({
			effects: StateEffect.appendConfig.of(
				compartment.of([
					keymap.of([
						{
							key: "Ctrl-Shift-v",
							run() {
								dispatch({ type: "toggle vim", payload: null });
								return true;
							},
						},
					]),
				])
			),
		});

		return () => {
			editorView.dispatch({
				effects: compartment?.reconfigure([]),
			});
		};
	}, [editorView]);

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

	const onRunCode = useCallback(async () => {
		const containerId = blogState.containerId;
		if (!session?.user) {
			setOpenLoginDialog(true);
			return;
		}
		setOpenShell(true);
		if (!containerId) {
			dispatch({
				type: "set output",
				payload: {
					[blockNumber]:
						"Enabling remote code execution, please wait",
				},
			});
			const newContainerId = await prepareContainer(
				language,
				containerId
			);
			dispatch({ type: "set containerId", payload: newContainerId });
		}
		dispatch({
			type: "set running block",
			payload: blockNumber,
		});
	}, [blogState.containerId, session?.user.id]);

	useEffect(() => {
		if (!editorView) return;
		const runCodeExtension = keymap.of([
			{
				key: "Shift-Enter",
				run() {
					onRunCode();
					return true;
				},
			},
		]);
		if (runCodeCompartment) {
			editorView.dispatch({
				effects: runCodeCompartment.reconfigure(runCodeExtension),
			});
			return;
		}

		const compartment = new Compartment();
		editorView?.dispatch({
			effects: StateEffect.appendConfig.of(
				compartment.of(runCodeExtension)
			),
		});
		setRunCodeCompartment(compartment);
	}, [editorView, onRunCode]);

	const onWriteCode = () => {
		dispatch({
			type: "set writing block",
			payload: blockNumber,
		});
	};

	return (
		<>
			<CodeBlock className="mt-2">
				{editorView && (
					<CodeBlockButtons
						file={file || "main"}
						language={language || ""}
						themeClasses={editorView?.themeClasses}
						className="justify-end"
					>
						<span className="text-sm grow cursor-pointer">
							{getFileNameWithExt(file || "main", language)}
						</span>
						<CodeBlockButton
							onClick={() => onRunCode()}
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
							tip={`${
								openShell ? "Hide Terminal" : "Show Terminal"
							}`}
						>
							<TerminalIcon size={16} />
						</CodeBlockButton>
						<CodeBlockButton
							tip={
								(vimEnabledLocally
									? "Disable Vim"
									: "Enable Vim") + " (Ctrl-Shift-v)"
							}
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
						<CodeBlockButton
							onClick={() =>
								navigator.clipboard
									.writeText(
										editorView?.state.sliceDoc() || ""
									)
									.then(() => setCopied(true))
									.then(() =>
										setTimeout(() => setCopied(false), 2000)
									)
							}
							tip="Copy code"
						>
							{copied ? <Check size={16} /> : <Copy size={16} />}
						</CodeBlockButton>
						<CodeBlockButton
							onClick={() => {
								setMinimize((p) => !p);
								setOpenShell(false);
							}}
							tip={minimize ? "maximize" : "minimize"}
						>
							{minimize ? (
								<FiMaximize2 size={14} />
							) : (
								<FiMinimize2 size={14} />
							)}
						</CodeBlockButton>
					</CodeBlockButtons>
				)}
				<div
					className={cn(
						"w-full border-2 border-border rounded-sm  rounded-se-none rounded-ss-none",
						minimize && "h-0 overflow-hidden"
					)}
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

			<LoginDialog
				dialog="Please login to execute code"
				open={openLoginDialog}
				setOpen={setOpenLoginDialog}
			/>
		</>
	);
}

function getFileNameWithExt(fileName: string, language: string) {
	const fileNameWithExtension =
		fileName?.includes(".") && language
			? fileName
			: `${fileName}${
					langToFileExtension[
						language as keyof typeof langToFileExtension
					]
			  }`;
	return fileNameWithExtension;
}

export default memo(MinimalCode);
