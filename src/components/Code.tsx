import {
	KeyboardEventHandler,
	MouseEventHandler,
	useContext,
	useEffect,
	useState,
} from "react";
import { BsPlayFill } from "react-icons/bs";
import { FcUndo } from "react-icons/fc";
import { SiPowershell } from "react-icons/si";
import { MdHideImage } from "react-icons/md";
import { BlogContext } from "../pages/_app";

import useEditor from "../hooks/useEditor";
import { BlogProps } from "../interfaces/BlogProps";
import { sendRequestToRceServer } from "../../utils/sendRequest";

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
	} = useContext(BlogContext);

	const [mounted, setMounted] = useState(false);
	const [openShell, setOpenShell] = useState(false);
	const [shellCommand, setShellCommand] = useState("");
	const { editorView } = useEditor({ language, blockNumber, code, mounted });

	useEffect(() => {
		setMounted(true);
	}, []);

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

	const onShellCommandRun: KeyboardEventHandler = async (e) => {
		if (e.key === "Enter" && setBlockToOutput) {
			const command = `sh- ${shellCommand}`;

			const resp = await sendRequestToRceServer("POST", {
				language,
				containerId,
				code: command,
			});

			if (resp.status !== 201) {
				setBlockToOutput({ [blockNumber]: resp.statusText });
				return;
			}
			const { output } = (await resp.json()) as { output: string };
			setBlockToOutput({ [blockNumber]: output });
		}
	};
	return (
		<div className="flex relative flex-col w-full ">
			{mounted && (
				<div
					className="w-full "
					id={`codearea-${blockNumber}`}
					onDoubleClick={() => {
						if (!collectCodeTillBlock) return;
						collectCodeTillBlock(blockNumber);
					}}
				></div>
			)}
			<div className="flex flex-row absolute right-2 m-1 gap-2">
				<button
					className="md:tooltip  md:tooltip-left mr-1"
					data-tip="Shell"
					onClick={() => setOpenShell((prev) => !prev)}
				>
					<SiPowershell className="text-cyan-400" />
				</button>
				{mounted && (
					<button
						onClick={() => {
							if (!collectCodeTillBlock) return;
							collectCodeTillBlock(blockNumber);
						}}
						className="md:tooltip  md:tooltip-left"
						data-tip="Run Code (Shift+Enter)"
						id={`run-${blockNumber}`}
					>
						<BsPlayFill className="text-cyan-400" />
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
					onClick={() => setHideOutput((prev) => !prev)}
					className="md:tooltip  md:tooltip-left"
					data-tip="Hide Output"
				>
					<MdHideImage className="text-cyan-400" />
				</button>
			</div>
			{openShell && (
				<div className="flex items-center font-mono bg-black rounded-md text-white mt-2 pl-2 p-1 gap-4">
					<span>{`>`}</span>
					<input
						type="text"
						name=""
						id=""
						className="focus:outline-none grow bg-black"
						value={shellCommand}
						onChange={(e) => setShellCommand(e.target.value)}
						onKeyDown={onShellCommandRun}
					/>
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
