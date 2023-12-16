/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Compartment } from "@codemirror/state";
import {
	MouseEventHandler,
	lazy,
	memo,
	useContext,
	useEffect,
	useState,
} from "react";

import useEditor from "../../hooks/useEditor";

import { DiVim } from "react-icons/di";
import useSyncHook from "@/hooks/useSyncHook";
import useToggleVim from "@/hooks/useToggleVim";
import { StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import {
	CodeBlock,
	CodeBlockButton,
	CodeBlockButtons,
} from "@components/EditorComponents/GenericCodeBlock";
import useTerminal from "./Terminal";
import {
	Check,
	ChevronRightSquare,
	Copy,
	Eraser,
	Pen,
	Terminal as TerminalIcon,
	Undo2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { langToFileExtension } from "@utils/constants";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { EditorContext } from "@/app/write/components/EditorContext";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
const EditorThemeCombobox = lazy(
	() => import("@/app/write/components/EditorThemeCombobox")
);

interface CodeProps {
	code: string;
	blockNumber: number;
	//These start and end number are the start and end positions of this code block in markdown
	start: number;
	end: number;
	file?: string;
	theme?: string;
}

function Code({
	code,
	blockNumber,
	start,
	end,
	file = "main",
	theme,
}: CodeProps) {
	const { blogState, dispatch } = useContext(BlogContext);
	const language = blogState.language;

	const [openShell, setOpenShell] = useState(false);
	const [copied, setCopied] = useState(false);

	const pathname = usePathname();
	const { editorView } = useEditor({
		language: language!,
		code,
		editorParentId: `codearea-${blockNumber}`,
		theme,
	});
	const { toggleVim, vimEnabled: vimEnabledLocally } = useToggleVim({
		editorView,
	});
	const [minimize, setMinimize] = useState(false);

	const terminal = useTerminal({ blockNumber });
	useSyncHook({
		editorView,
		startOffset: start,
		endOffset: end,
	});

	useEffect(() => {
		// configuring shortcut to run code
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

	if (!language) {
		return (
			<pre>
				Please specify a language in frontmatter like so -
				<code>{`language: "javascript"`}</code>
			</pre>
		);
	}

	return (
		<CodeBlock className="mt-2">
			<CodeBlockButtons
				file={file}
				language={language || ""}
				themeClasses={editorView?.themeClasses}
				className={cn(!file && "justify-end")}
			>
				{language &&
					(pathname?.startsWith("/write") ? (
						<FileNameChanger
							fileName={file}
							language={language}
							start={start}
						/>
					) : (
						<span className="text-sm grow cursor-pointer">
							{getFileNameWithExt(file, language)}
						</span>
					))}
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
				{!pathname?.startsWith("/write") && (
					<CodeBlockButton
						onClick={onUndo}
						tip="back to original code"
					>
						<Undo2 size={16} />
					</CodeBlockButton>
				)}
				<CodeBlockButton
					onClick={() => setOpenShell((prev) => !prev)}
					tip={`${openShell ? "Hide Terminal" : "Show Terminal"}`}
				>
					<TerminalIcon size={16} />
				</CodeBlockButton>
				<CodeBlockButton
					tip={
						(vimEnabledLocally ? "Disable Vim" : "Enable Vim") +
						"Ctrl-Shift-v"
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
							.writeText(editorView?.state.sliceDoc() || "")
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
			></div>

			{/* <Terminal {...{ blockNumber, openShell }} /> */}
			{/* ----------------Terminal----------------- */}
			<div
				className={cn(
					"not-prose border-[1px] border-white/50 rounded-sm z-10  mt-2 bg-black pl-2 pb-1 overflow-y-auto ",
					!openShell && "hidden",
					"custom-terminal"
				)}
				id={`terminal-${blockNumber}`}
				key={`terminal-${blockNumber}`}
			></div>
			{pathname?.startsWith("/write") && (
				<div className="self-center flex gap-2 w-fit mt-2 ">
					<EditorThemeCombobox start={start} theme={theme || ""} />
				</div>
			)}
		</CodeBlock>
	);
}

function FileNameChanger({
	fileName,
	language,
	start,
}: {
	fileName: string;
	language: string;
	start: number;
}) {
	const [fullFileName, setFullFileName] = useState(fileName);
	const [edit, setEdit] = useState(false);
	const { editorState } = useContext(EditorContext);

	useEffect(() => {
		setFullFileName(getFileNameWithExt(fileName, language));
	}, [fileName]);

	const onSetFileName = () => {
		if (!start) return;
		const { editorView, frontMatterLength } = editorState;
		const lineMeta = editorView?.state.doc.lineAt(
			start + frontMatterLength - 1
		);
		if (!lineMeta) return;
		const splitLineMeta = lineMeta.text.split("&");
		const themeMeta = splitLineMeta[1];

		let newMeta = "```" + `file=${fullFileName}`;
		if (themeMeta) {
			newMeta += "&" + themeMeta;
		}
		editorView?.dispatch({
			changes: {
				from: lineMeta?.from,
				to: lineMeta.to,
				insert: newMeta,
			},
		});

		setEdit(false);
	};

	if (edit) {
		return (
			<div className="flex grow gap-2">
				<Input
					value={fullFileName}
					className="h-6 w-fit"
					onChange={(e) => setFullFileName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							onSetFileName();
						}
					}}
				/>
				<Button
					variant={"outline"}
					className="h-6 w-fit p-2"
					onClick={onSetFileName}
				>
					Set filename
				</Button>
			</div>
		);
	}
	return (
		<span
			className="text-sm grow cursor-pointer"
			onClick={() => setEdit(true)}
		>
			{fullFileName}
		</span>
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
export default memo(Code);
