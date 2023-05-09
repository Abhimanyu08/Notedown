"use client";
import { EditorView } from "codemirror";
import React, {
	Dispatch,
	Reducer,
	useReducer,
	createContext,
	useEffect,
} from "react";
import { ALLOWED_LANGUAGES, langToExtension } from "../../../utils/constants";
import { sendRequestToRceServer } from "../../../utils/sendRequest";

interface BlogStateInterface {
	blockToOutput: Record<string, string>;
	vimEnabled: boolean;
	blockToEditor: Record<number, EditorView>;
	runningRequest: boolean;
	runningBlock: number | null;
	writingBlock: number | null;
	author: string;
	containerId: string;
	language?: (typeof ALLOWED_LANGUAGES)[number];
}

const blogInitialState: BlogStateInterface = {
	blockToOutput: {},
	vimEnabled: false,
	blockToEditor: {},
	runningRequest: false,
	runningBlock: null,
	writingBlock: null,
	author: "",
	containerId: "",
	language: "python",
};
interface DispatchObj {
	type:
		| "set containerId"
		| "toggle vim"
		| "set output"
		| "set editor"
		| "set writing block"
		| "set running block"
		| "toggle running request";
	payload: BlogStateInterface[keyof BlogStateInterface];
}

const reducer: Reducer<BlogStateInterface, DispatchObj> = (state, action) => {
	switch (action.type) {
		case "set containerId": {
			return {
				...state,
				containerId: action.payload as string,
			};
		}
		case "toggle vim": {
			return {
				...state,
				vimEnabled: !state.vimEnabled,
			};
		}
		case "set output": {
			return {
				...state,
				blockToOutput: {
					...state.blockToOutput,
					...(action.payload as Record<number, string>),
				},
			};
		}
		case "set editor": {
			return {
				...state,
				blockToEditor: {
					...state.blockToEditor,
					...(action.payload as Record<number, EditorView>),
				},
			};
		}
		case "set running block": {
			return {
				...state,
				runningBlock: action.payload as number | null,
			};
		}
		case "set writing block": {
			return {
				...state,
				writingBlock: action.payload as number | null,
			};
		}
		case "toggle running request": {
			return {
				...state,
				runningRequest: !state.runningRequest,
			};
		}
		default:
			return blogInitialState;
	}
};

export const BlogContext = createContext<{
	blogState: BlogStateInterface;
	dispatch: Dispatch<DispatchObj>;
}>({
	blogState: blogInitialState,
	dispatch: () => {},
});

function BlogContextProvider({
	children,
	language,
}: {
	children: React.ReactNode;
	language?: (typeof ALLOWED_LANGUAGES)[number];
}) {
	const [blogState, dispatch] = useReducer<typeof reducer>(reducer, {
		...blogInitialState,
		language,
	});
	useEffect(() => {
		if (!language) return;
		const {
			containerId,
			runningBlock,
			writingBlock,
			runningRequest,
			blockToEditor,
		} = blogState;
		console.log(runningBlock, writingBlock);
		// return;
		if (runningBlock === null && writingBlock === null) return;
		let block: number;
		if (typeof runningBlock === "number") {
			block = runningBlock;
		} else {
			block = writingBlock as number;
		}
		console.log(blockToEditor, block);
		if (runningRequest) {
			// setBlockToOutput({
			// 	[(runningBlock || writingBlock) as number]:
			// 		"Previous request is pending, please wait",
			// });
			dispatch({
				type: "set output",
				payload: {
					[block]: "Previous request is pending, please wait.",
				},
			});
			return;
		}

		if (!containerId) {
			// setBlockToOutput({
			// 	[(runningBlock || writingBlock) as number]:
			// 		"Please enable remote code execution",
			// });
			dispatch({
				type: "set output",
				payload: {
					[block]: "Please enable remote code execution",
				},
			});
			return;
		}

		dispatch({ type: "toggle running request", payload: {} });

		const firstLine = blockToEditor[block]?.state.doc
			.toJSON()
			.filter((l) => l !== "")
			.at(0);
		const fileName = checkFileName(firstLine || "");
		let codeArray: string[] = [];

		for (let i = 0; i <= block; i++) {
			if (document.getElementById(`codearea-${i}`)) {
				let blockCodeArray = blockToEditor[i].state.doc
					.toJSON()
					.filter((l) => l !== "");
				const firstLineOfBlock = blockCodeArray[0];
				if (!fileName) {
					if (!checkFileName(firstLineOfBlock)) {
						codeArray = codeArray.concat(blockCodeArray);
					}
				} else {
					const blockFileName = checkFileName(firstLineOfBlock);
					if (
						blockFileName === fileName ||
						blockFileName + langToExtension[language] ===
							fileName ||
						blockFileName === fileName + langToExtension[language]
					) {
						codeArray = codeArray.concat(blockCodeArray.slice(1));
					}
				}
			}
		}

		const code = codeArray.join("\n");
		const run = typeof writingBlock !== "number";
		console.log(run, code);
		runCodeRequest({ code, run, containerId, fileName, language }).then(
			(val) => {
				// setBlockToOutput((prev) => ({ ...prev, [block]: val }));
				dispatch({ type: "set output", payload: { [block]: val } });

				dispatch({ type: "set running block", payload: null });
				dispatch({ type: "set writing block", payload: null });
				dispatch({ type: "toggle running request", payload: {} });
			}
		);
	}, [blogState.runningBlock, blogState.writingBlock]);

	return (
		<BlogContext.Provider value={{ blogState, dispatch }}>
			{children}
		</BlogContext.Provider>
	);
}

export default BlogContextProvider;

function checkFileName(firstLine: string): string {
	return /file-(.*)/.exec(firstLine)?.at(1)?.trim() || "";
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
	let sessionCodeToOutput = sessionStorage.getItem(code);

	if (sessionCodeToOutput) {
		if (!run) return "";
		return sessionCodeToOutput;
	}

	const params: Parameters<typeof sendRequestToRceServer> = [
		"POST",
		{ language, containerId, code, fileName, run },
	];
	const resp = await sendRequestToRceServer(...params);

	if (resp.status !== 201) {
		return resp.statusText;
	}
	const { output } = (await resp.json()) as { output: string };

	try {
		sessionStorage.setItem(code, output);
	} catch {}

	return output;
}
