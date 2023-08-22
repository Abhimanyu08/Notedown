import { memo, useContext, useEffect, useState } from "react";
import { sendRequestToRceServer } from "@utils/sendRequest";
import { BlogContext } from "@components/BlogPostComponents/BlogState";

function useTerminal({ blockNumber }: { blockNumber: number }) {
	const [terminal, setTerminal] = useState<any>(undefined);
	const [terminalCommand, setTerminalCommand] = useState("");
	const [sendTerminalCommand, setSendTerminalCommand] = useState(false);

	// const { blockToOutput, setBlockToOutput } = useContext(BlogContext)
	const { blogState, dispatch } = useContext(BlogContext);
	const { containerId } = blogState;

	useEffect(() => {
		if (terminal !== undefined) return;

		import("xterm").then((val) => {
			const { Terminal } = val;
			const term = new Terminal({
				disableStdin: false,
				rows: 10,
				cols: 100,
				cursorBlink: true,
				fontWeight: "700",
			});
			const termElement = document.getElementById(
				`terminal-${blockNumber}`
			);
			termElement?.replaceChildren("");
			if (termElement === null) return;
			term.open(termElement);
			term.onKey((key) => {
				// term.clear();
				if (key.key === "\u007f") {
					term.write("\b \b");
					// term.clear();

					setTerminalCommand((prev) =>
						prev.slice(0, prev.length - 1)
					);
					return;
				}
				if (key.key === "\r") {
					setSendTerminalCommand(true);
					return;
				}
				setTerminalCommand((prev) => prev + key.key);
				term.write(key.key);
			});
			setTerminal(term);
		});
	}, [blockNumber]);

	useEffect(() => {
		if (!containerId) {
			terminal?.writeln(
				"\r\n" + "Please enable remote code execution" || ""
			);
			return;
		}

		if (sendTerminalCommand) {
			runShellCommand({ containerId, command: terminalCommand }).then(
				(val) => {
					// setBlockToOutput({ [blockNumber]: val })

					terminal?.writeln("\r\n" + val);
					setTerminalCommand("");
					setSendTerminalCommand(false);
				}
			);
		}
	}, [sendTerminalCommand]);

	useEffect(() => {
		if (!Object.hasOwn(blogState.blockToOutput, blockNumber)) return;
		const { runningBlock, blockToFileName, blockToOutput } = blogState;
		if (runningBlock !== blockNumber) return;
		const currentFile = blockToFileName[blockNumber];

		let previousOutputsLength = 0;
		for (let [previosBlockNumber, output] of Object.entries(
			blockToOutput
		)) {
			if (parseInt(previosBlockNumber) >= blockNumber) break;
			if (blockToFileName[parseInt(previosBlockNumber)] === currentFile) {
				previousOutputsLength += output.length;
			}
		}
		const currentOutput = blogState.blockToOutput[blockNumber].slice(
			previousOutputsLength
		);
		terminal?.writeln("\r\n" + currentOutput);

		// if (setBlockToOutput) setBlockToOutput({})
		dispatch({ type: "set running block", payload: null });
		dispatch({ type: "set writing block", payload: null });
		// dispatch({ type: "set output", payload: { [blockNumber]: null } });
	}, [blogState.blockToOutput]);

	return terminal;
}

async function runShellCommand({
	containerId,
	command,
}: {
	containerId?: string;
	command: string;
}) {
	const resp = await sendRequestToRceServer("POST", {
		language: "shell",
		containerId,
		code: command,
	});

	if (resp.status !== 201) {
		return resp.statusText;
	}
	const { output } = (await resp.json()) as { output: string };
	return output;
}

export default useTerminal;
