import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { MdHideImage, MdImage } from "react-icons/md";
import { SiPowershell, SiVim } from "react-icons/si";
import { BlogContext } from "../../pages/_app";

import { sendRequestToRceServer } from "../../../utils/sendRequest";
import useEditor from "../../hooks/useEditor";
import { BlogProps } from "../../interfaces/BlogProps";

import { vim } from "@replit/codemirror-vim";
import { StateEffect } from "@codemirror/state";
import getExtensions from "../../../utils/getExtensions";
import useTerminal from "../../hooks/useTerminal";
interface CodeProps {
	code: string;
	language: BlogProps["language"];
	blockNumber: number;
}

function Code({ code, language, blockNumber }: CodeProps) {
	const {
		containerId,
		setBlockToCode,
		collectCodeTillBlock,
		vimEnabled,
		setVimEnabled,
	} = useContext(BlogContext);

	const [mounted, setMounted] = useState(false);
	const [openShell, setOpenShell] = useState(true);
	const [awaitingResult, setAwaitingResult] = useState(false);
	const { editorView } = useEditor({
		language,
		blockNumber,
		code,
		mounted,
		editorParentId: `codearea-${blockNumber}`,
	});

	useTerminal({
		containerId,
		language,
		blockNumber,
		mounted,
	});

	useEffect(() => {
		setMounted(true);
	}, [mounted]);

	// useEffect(() => {
	// 	if (blockToOutput && Object.hasOwn(blockToOutput, blockNumber)) {
	// 		setAwaitingResult(false);
	// 		setAwaitingShellResult(false)
	// 		setBlockToOutput({});
	// 	}
	// }, [blockToOutput]);

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

	return (
		<div className="flex relative flex-col w-full ">
			<div className="flex flex-row  gap-5 w-fit self-end bg-black py-1 px-3 rounded-t-md">
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
					onClick={onUndo}
					className="md:tooltip  md:tooltip-left"
					data-tip="back to original code"
				>
					<FcUndo className="text-cyan-400" />
				</button>
				<button
					onClick={() => setOpenShell((prev) => !prev)}
					className="md:tooltip  md:tooltip-left"
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

			{mounted && (
				<div
					className={`not-prose  mt-2 bg-black pl-2 pb-1 ${
						openShell ? "" : "hidden"
					}`}
					id={`terminal-${blockNumber}`}
				></div>
			)}
		</div>
	);
}

export default Code;
