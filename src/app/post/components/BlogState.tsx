"use client";
import { ALLOWED_LANGUAGES, langToExtension } from "@utils/constants";
import { sendRequestToRceServer } from "@utils/sendRequest";
import { EditorView } from "codemirror";
import React, {
	Dispatch,
	Reducer,
	createContext,
	useEffect,
	useReducer,
} from "react";

interface BlogStateInterface {
	blockToOutput: Record<string, string>;
	vimEnabled: boolean;
	blockToEditor: Record<number, EditorView>;
	runningRequest: boolean;
	runningBlock: number | null;
	writingBlock: number | null;
	containerId: string | null;
	blogMeta: Partial<{
		id: number;
		title: string;
		author: string;
		description: string;
		language: (typeof ALLOWED_LANGUAGES)[number];
		content: string;
		imageFolder: string;
		markdown: string;
	}>;
	canvasApps: Record<string, any>;
	uploadedImages: Record<string, string>;
	imagesToFiles: Record<string, File>;
	imagesToUpload: string[];
}

const blogInitialState: BlogStateInterface = {
	blockToOutput: {},
	vimEnabled: false,
	blockToEditor: {},
	runningRequest: false,
	runningBlock: null,
	writingBlock: null,
	containerId: null,
	blogMeta: {},
	canvasApps: {},
	imagesToFiles: {},
	uploadedImages: {},
	imagesToUpload: [],
};

interface DispatchObj {
	type:
		| "set containerId"
		| "toggle vim"
		| "set output"
		| "set editor"
		| "set writing block"
		| "set running block"
		| "toggle running request"
		| "set blog meta"
		| "set canvas apps"
		| "set image to files"
		| "add images to upload"
		| "remove image from upload"
		| "remove container"
		| "set uploaded images"
		| "remove canvas app"
		| "empty canvas apps";
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
		case "set blog meta":
			return {
				...state,
				blogMeta: {
					...state.blogMeta,
					...(action.payload as BlogStateInterface["blogMeta"]),
				},
			};
		case "set canvas apps":
			return {
				...state,
				canvasApps: {
					...state.canvasApps,
					...(action.payload as Record<string, any>),
				},
			};

		case "set image to files":
			return {
				...state,
				imagesToFiles: {
					...state.imagesToFiles,
					...(action.payload as Record<string, File>),
				},
			};

		case "add images to upload":
			return {
				...state,
				imagesToUpload: [
					...state.imagesToUpload,
					...(action.payload as string[]),
				],
			};

		case "remove image from upload":
			const imagesToUpload = state.imagesToUpload;
			const imagesToDelete = action.payload as string[];
			for (let image of imagesToDelete) {
				const index = imagesToUpload.findIndex((i) => i === image);
				if (index !== -1) {
					imagesToUpload.splice(index, 1);
				}
			}
			return {
				...state,
				imagesToUpload: imagesToUpload,
			};
		case "remove canvas app":
			const currentCanvasApps = { ...state.canvasApps };
			delete currentCanvasApps[action.payload as string];
			return {
				...state,
				canvasApps: currentCanvasApps,
			};
		case "remove container":
			return {
				...state,
				containerId: null,
			};

		case "set uploaded images":
			return {
				...state,
				uploadedImages: action.payload as Record<string, string>,
			};
		case "empty canvas apps":
			return {
				...state,
				canvasApps: {},
			};
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
	blogMeta,
	uploadedImages,
}: {
	children: React.ReactNode;
	blogMeta?: BlogStateInterface["blogMeta"];
	uploadedImages?: BlogStateInterface["uploadedImages"];
}) {
	const [blogState, dispatch] = useReducer<typeof reducer>(reducer, {
		...blogInitialState,
		blogMeta: {
			...blogInitialState.blogMeta,
			...blogMeta,
		},
		uploadedImages: uploadedImages || {},
	});

	useEffect(() => {
		let language = blogState.blogMeta.language;
		if (!language) return;
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

		const firstLine = blockToEditor[block]?.state.doc.lineAt(0).text;
		const fileName = checkFileName(firstLine || "");
		let codeArray: string[] = [];

		for (let i = 0; i <= block; i++) {
			if (document.getElementById(`codearea-${i}`)) {
				let firstLineOfBlock =
					blockToEditor[i].state.doc.lineAt(0).text;
				if (!fileName) {
					if (!checkFileName(firstLineOfBlock)) {
						codeArray.push(blockToEditor[i].state.sliceDoc());
					}
				} else {
					const blockFileName = checkFileName(firstLineOfBlock);
					if (
						blockFileName === fileName ||
						blockFileName + langToExtension[language] ===
							fileName ||
						blockFileName === fileName + langToExtension[language]
					) {
						codeArray.push(blockToEditor[i].state.sliceDoc());
					}
				}
			}
		}

		const code = codeArray.join("\n");
		const run = typeof writingBlock !== "number";
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
