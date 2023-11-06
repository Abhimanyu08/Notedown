import {
	BlogContext,
	BlogStateInterface,
	DispatchObj,
} from "@components/BlogPostComponents/BlogState";
import { ALLOWED_LANGUAGES, langToExtension } from "@utils/constants";
import { sendRequestToRceServer } from "@utils/sendRequest";
import { Dispatch, useContext, useEffect } from "react";

export function useRunCode({
	blogState,
	dispatch,
}: {
	blogState: BlogStateInterface;
	dispatch: Dispatch<DispatchObj>;
}) {
	useEffect(() => {
		let language = blogState.blogMeta.language;
		if (!language || !ALLOWED_LANGUAGES.includes(language as any)) return;
		const {
			containerId,
			runningBlock,
			writingBlock,
			runningRequest,
			blockToEditor,
		} = blogState;
		// return;
		if (runningBlock === null && writingBlock === null) return;
		let block: number;
		if (typeof runningBlock === "number") {
			block = runningBlock;
		} else {
			block = writingBlock as number;
		}
		if (runningRequest) {
			dispatch({
				type: "set output",
				payload: {
					[block]: "Previous request is pending, please wait.",
				},
			});
			return;
		}

		if (!containerId) {
			dispatch({
				type: "set output",
				payload: {
					[block]: "Please enable remote code execution",
				},
			});

			dispatch({ type: "set running block", payload: null });
			dispatch({ type: "set writing block", payload: null });
			return;
		}

		dispatch({ type: "toggle running request", payload: null });

		const fileName = blogState.blockToFileName[block];
		let codeArray: string[] = [];

		for (let i = 0; i <= block; i++) {
			if (document.getElementById(`codearea-${i}`)) {
				const blockFileName = blogState.blockToFileName[i];
				if (
					blockFileName === fileName ||
					blockFileName +
					langToExtension[
					language as keyof typeof langToExtension
					] ===
					fileName ||
					blockFileName ===
					fileName +
					langToExtension[
					language as keyof typeof langToExtension
					]
				) {
					codeArray.push(blockToEditor[i].state.sliceDoc());
				}
			}
		}

		const code = codeArray.join("\n");
		const run = typeof writingBlock !== "number";
		runCodeRequest({
			code,
			run,
			containerId,
			fileName: fileName as string,
			language: language as any,
		}).then((val) => {
			if (val === "Limit exceeded") val += ", Limit: 5 requests every 30 seconds"
			dispatch({ type: "set output", payload: { [block]: val } });

			dispatch({ type: "set running block", payload: null });
			dispatch({ type: "set writing block", payload: null });
			dispatch({ type: "toggle running request", payload: null });
		});
	}, [blogState.runningBlock, blogState.writingBlock]);
}

type runCodeParams = {
	code: string;
	run: boolean;
	language: (typeof ALLOWED_LANGUAGES)[number];
	containerId: string;
	fileName?: string;
};

async function runCodeRequest({
	code,
	run,
	language,
	containerId,
	fileName,
}: runCodeParams) {
	// let sessionCodeToOutput = sessionStorage.getItem(code);

	// if (sessionCodeToOutput) {
	// 	if (!run) return "";
	// 	return sessionCodeToOutput;
	// }

	const params: Parameters<typeof sendRequestToRceServer> = [
		"POST",
		{ language, containerId, code, fileName, run },
	];
	try {
		const resp = await sendRequestToRceServer(...params);

		if (resp.status !== 201) {
			return "Limit exceeded";
		}
		const { output } = (await resp.json()) as { output: string };

		// try {
		// 	sessionStorage.setItem(code, output);
		// } catch { }

		return output;
	} catch (e) {
		if ((e as any).name === "AbortError") {
			return "Code running request aborted after 10 seconds";
			// Handle abort here
		} else {
			return "Unexpected Error";
		}
	}
}
