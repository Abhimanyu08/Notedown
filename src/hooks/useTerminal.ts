import { useContext, useEffect, useState } from "react";
import { ALLOWED_LANGUAGES } from "../../utils/constants";
import { sendRequestToRceServer } from "../../utils/sendRequest";
import { BlogContext } from "../pages/_app";

export default function useTerminal({ containerId, blockNumber, language, mounted }: {
    containerId: string | undefined, blockNumber: number, language: typeof ALLOWED_LANGUAGES[number], mounted: boolean
}) {
    const [terminal, setTerminal] = useState<any>();
    const [terminalCommand, setTerminalCommand] = useState("");
    const [sendTerminalCommand, setSendTerminalCommand] = useState(false);

    const { blockToOutput, setBlockToOutput } = useContext(BlogContext)

    useEffect(() => {
        if (terminal !== undefined) return;

        import("xterm").then((val) => {
            const { Terminal } = val;
            const term = new Terminal({
                disableStdin: false,
                rows: 10,
                cols: 120,
                cursorBlink: true,
                fontWeight: "800"
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
    }, [mounted, blockNumber]);


    useEffect(() => {
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
            // setAwaitingShellResult(true);
            if (!containerId) {
                setBlockToOutput({ [blockNumber]: "Please enable remote code execution" })
                return
            }
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
        if (sendTerminalCommand) {
            onShellCommandRun({ language, containerId, command: terminalCommand })
            setTerminalCommand("")
            setSendTerminalCommand(false)
        }
    }, [sendTerminalCommand])

    useEffect(() => {
        if (!blockToOutput || blockToOutput[blockNumber] === undefined) return
        terminal?.write("\r\n" + blockToOutput[blockNumber] + "\r\n" || "");
        if (setBlockToOutput) setBlockToOutput({})
    }, [blockToOutput]);



    return {
        terminal
    }
}