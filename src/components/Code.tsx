import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage } from "react-icons/md";
import { SiPowershell, SiVim } from "react-icons/si";
import { BlogContext } from "../pages/_app";

import { sendRequestToRceServer } from "../../utils/sendRequest";
import useEditor from "../hooks/useEditor";
import { BlogProps } from "../interfaces/BlogProps";
import { EditorView } from "codemirror";

import { vim } from "@replit/codemirror-vim";
import { StateEffect } from "@codemirror/state";
import getExtensions from "../../utils/getExtensions";
interface CodeProps {
	code: string;
	language: BlogProps["language"] | "markdown";
	blockNumber: number;
}

function Code({ code, language, blockNumber }: CodeProps) {
	const [hideOutput, setHideOutput] = useState(false);
	const {
		containerId,
		blockToOutput,
		setBlockToCode,
		collectCodeTillBlock,
		setBlockToOutput,
		vimEnabled,
		setVimEnabled,
	} = useContext(BlogContext);

	const [mounted, setMounted] = useState(false);
	const [openShell, setOpenShell] = useState(false);
	const [shellCommand, setShellCommand] = useState("");
	const [awaitingResult, setAwaitingResult] = useState(false);
	const [awaitingShellResult, setAwaitingShellResult] = useState(false);
	const { editorView } = useEditor({
		language,
		blockNumber,
		code,
		mounted,
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (blockToOutput && Object.hasOwn(blockToOutput, blockNumber)) {
			setAwaitingResult(false);
			setAwaitingShellResult(false);
		}
	}, [blockToOutput]);

	useEffect(() => {
		const playButton = document.getElementById(
			`run-${blockNumber}`
		) as HTMLButtonElement | null;
		if (!playButton) return;

		playButton.onfocus = (e) => {
			e.preventDefault();

			if (!setBlockToCode) return;
			const codeArray = editorView?.state.doc.toJSON() || [""];
			const code = codeArray.join("\n");
			if (/file-((.)+)/.exec(codeArray[0])) {
				setBlockToCode({
					[blockNumber]: code,
				});
				return;
			}
			setBlockToCode((prev) => ({
				...prev,
				[blockNumber]: code,
			}));
		};
	}, [blockNumber, editorView]);

	const onUndo: MouseEventHandler = () => {
		const docLength = editorView?.state.doc.length;

		editorView?.dispatch({
			changes: { from: 0, to: docLength, insert: code },
		});
	};

	useEffect(() => {
		if (!editorView) return;
		if (vimEnabled) {
			editorView.dispatch({
				effects: StateEffect.reconfigure.of([
					vim(),
					...getExtensions({
						language,
						blockNumber,
						collectCodeTillBlock,
					}),
				]),
			});
		}
		if (!vimEnabled) {
			editorView.dispatch({
				effects: StateEffect.reconfigure.of(
					getExtensions({
						language,
						blockNumber,
						collectCodeTillBlock,
					})
				),
			});
		}
	}, [vimEnabled]);

	const onShellCommandRun = async ({
		language,
		containerId,
		command,
	}: {
		language?: string;
		containerId?: string;
		command: string;
	}) => {
		if (!setBlockToOutput) return;
		setAwaitingShellResult(true);
		const code = `sh- ${command}`;

		const resp = await sendRequestToRceServer("POST", {
			language,
			containerId,
			code,
		});

		if (resp.status !== 201) {
			setBlockToOutput({ [blockNumber]: resp.statusText });
			return;
		}
		const { output } = (await resp.json()) as { output: string };
		setBlockToOutput({ [blockNumber]: output });
	};

	return (
		<div className="flex relative flex-col w-full ">
			<div className="flex flex-row  gap-3 w-fit self-end bg-black py-1 px-3 rounded-t-md">
				{mounted && (
					<button
						onClick={() => {
							setAwaitingResult(true);
							if (!collectCodeTillBlock) return;
							collectCodeTillBlock(blockNumber);
						}}
						className="md:tooltip  md:tooltip-left"
						data-tip="Run Code (Shift+Enter)"
						id={`run-${blockNumber}`}
					>
						<BsPlayFill
							className={`text-cyan-400 ${
								awaitingResult ? "animate-pulse" : ""
							}`}
							size={16}
						/>
					</button>
				)}
				<button
					className="md:tooltip  md:tooltip-left mr-1"
					data-tip="Shell"
					onClick={() => setOpenShell((prev) => !prev)}
				>
					<SiPowershell className="text-cyan-400" size={14} />
				</button>
				<button
					onClick={onUndo}
					className="md:tooltip  md:tooltip-left"
					data-tip="back to original code"
				>
					<FcUndo className="text-cyan-400" />
				</button>
				<button
					onClick={() => setHideOutput((prev) => !prev)}
					className="md:tooltip  md:tooltip-left"
					data-tip="Hide Output"
				>
					<MdHideImage className="text-cyan-400" />
				</button>
				<button
					className="md:tooltip hidden lg:block mr-1"
					data-tip="Enable Vim"
					onClick={() => {
						if (setVimEnabled) setVimEnabled((prev) => !prev);
					}}
				>
					<SiVim
						className={`${
							vimEnabled ? "text-lime-400" : "text-cyan-400"
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
						setAwaitingResult(true);
						if (!collectCodeTillBlock) return;
						collectCodeTillBlock(blockNumber);
					}}
				></div>
			)}

			{openShell && (
				<div className="flex items-center font-mono bg-black rounded-md text-white mt-2 pl-2 p-1 gap-4">
					<span
						className={`${
							awaitingShellResult ? "animate-pulse" : ""
						}`}
					>{`>`}</span>
					<input
						type="text"
						name=""
						id=""
						className="focus:outline-none grow bg-black"
						value={shellCommand}
						onChange={(e) => setShellCommand(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter")
								onShellCommandRun({
									language,
									containerId,
									command: shellCommand,
								});
						}}
						onDoubleClick={(e) => {
							e.preventDefault();
							onShellCommandRun({
								language,
								containerId,
								command: shellCommand,
							});
						}}
					/>
					<div
						className="p-1 rounded-md"
						onClick={() => {
							onShellCommandRun({
								language,
								containerId,
								command: shellCommand,
							});
						}}
					>
						<BsPlayFill className="text-cyan-400" />
					</div>
				</div>
			)}
			{blockToOutput && blockToOutput[blockNumber] && (
				<div className="not-prose">
					<pre
						className={`text-white overflow-x-auto mt-2 p-4 rounded-md bg-black ${
							hideOutput ? "hidden" : ""
						}`}
					>
						<code className="max-w-full">
							{blockToOutput[blockNumber].trim()}
						</code>
					</pre>
				</div>
			)}
		</div>
	);
}

export default Code;
