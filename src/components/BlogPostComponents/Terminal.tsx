import { memo, useContext, useEffect, useState } from "react";
import { sendRequestToRceServer } from "@utils/sendRequest";
import { BlogContext } from "@/app/apppost/components/BlogState";

function Terminal({
	blockNumber,
	openShell,
}: {
	blockNumber: number;
	openShell: boolean;
}) {
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
			// setBlockToOutput({ [blockNumber]: "Please enable remote code execution" })
			// dispatch({ type: "set output", payload: { [blockNumber]: "Please enable remote code execution" } })
			terminal?.writeln(
				"\r\n" + "Please enable remote code execution" || ""
			);
			return;
		}

		if (sendTerminalCommand) {
			runShellCommand({ containerId, command: terminalCommand }).then(
				(val) => {
					// setBlockToOutput({ [blockNumber]: val })
					dispatch({
						type: "set output",
						payload: { [blockNumber]: val },
					});
					setTerminalCommand("");
					setSendTerminalCommand(false);
				}
			);
		}
	}, [sendTerminalCommand]);

	useEffect(() => {
		if (
			!Object.hasOwn(blogState.blockToOutput, blockNumber) ||
			blogState.blockToOutput[blockNumber] === ""
		)
			return;
		terminal?.writeln("\r\n" + blogState.blockToOutput[blockNumber] || "");
		// if (setBlockToOutput) setBlockToOutput({})
		dispatch({ type: "set output", payload: { [blockNumber]: "" } });
	}, [blogState.blockToOutput]);

	return (
		<div
			className={`not-prose border-[1px] border-white/50 rounded-sm  mt-2 bg-black pl-2 pb-1 overflow-y-auto ${
				openShell ? "" : "hidden"
			} `}
			id={`terminal-${blockNumber}`}
			key={`terminal-${blockNumber}`}
		></div>
	);
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

export default memo(Terminal);
