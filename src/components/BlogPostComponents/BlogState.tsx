"use client";
import { useJumpBetweenCodeBlocks } from "@/hooks/useJumpBetweenCodeBlocks";
import { useRunCode } from "@/hooks/useRunCode";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import { sendRequestToRceServer } from "@utils/sendRequest";
import { EditorView } from "codemirror";
import React, {
	Dispatch,
	Reducer,
	createContext,
	useEffect,
	useReducer,
} from "react";

export interface BlogStateInterface {
	blockToOutput: Record<number, string>;
	vimEnabled: boolean;
	blockToEditor: Record<number, EditorView>;
	runningRequest: boolean;
	runningBlock: number | null;
	writingBlock: number | null;
	blockToFileName: Record<number, string>;
	containerId: string | null;
	blogMeta: Partial<{
		id: number;
		author: string;
		blogger: { id: string; name: string };
		imageFolder: string | null;
		timeStamp: string;
		published: boolean;
		slug: string;
	}>;
	language: string | null;
	uploadedImages: Record<string, string>;
	uploadedFileNames?: string[];
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
	blockToFileName: {},
	uploadedImages: {},
	uploadedFileNames: [],
	language: null,
	// imagesToUpload: [],
};

export interface DispatchObj {
	type:
		| "set containerId"
		| "toggle vim"
		| "set output"
		| "set editor"
		| "set writing block"
		| "set running block"
		| "toggle running request"
		| "set blog meta"
		| "remove container"
		| "set uploaded images"
		| "remove editor"
		| "add sandbox filenames"
		| "set block to filename"
		| "set language";
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
		case "set language": {
			const payload = action.payload as any;
			return {
				...state,
				language: payload,
			};
		}
		case "toggle vim": {
			return {
				...state,
				vimEnabled: !state.vimEnabled,
			};
		}

		case "set block to filename": {
			return {
				...state,
				blockToFileName: {
					...state.blockToFileName,
					...(action.payload as any),
				},
			};
		}
		case "add sandbox filenames": {
			return {
				...state,
				uploadedFileNames: action.payload as string[],
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
		case "remove editor": {
			delete state.blockToEditor[action.payload as number];
			return {
				...state,
				blockToEditor: state.blockToEditor,
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
			// if (
			// 	!hasBlogMetaChanged(state.blogMeta, {
			// 		...state.blogMeta,
			// 		...(action.payload as BlogStateInterface["blogMeta"]),
			// 	})
			// ) {
			// 	return state;
			// }
			return {
				...state,
				blogMeta: {
					...state.blogMeta,
					...(action.payload as BlogStateInterface["blogMeta"]),
				},
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
	blogMeta,
	uploadedImages = {},
	fileNames,
}: {
	children: React.ReactNode;
	language?: string;
	blogMeta?: BlogStateInterface["blogMeta"];
	uploadedImages?: BlogStateInterface["uploadedImages"];
	fileNames?: BlogStateInterface["uploadedFileNames"];
}) {
	const [blogState, dispatch] = useReducer<typeof reducer>(reducer, {
		...blogInitialState,
		blogMeta: {
			...blogInitialState.blogMeta,
			...blogMeta,
		},
		uploadedImages,
		language: language || null,
		uploadedFileNames: fileNames,
	});
	useEffect(() => {
		// kill the container on the server once this component unmounts
		const { containerId } = blogState;
		if (!containerId) return;
		return () => {
			sendRequestToRceServer("DELETE", { containerId });
		};
	}, [blogState.containerId]);

	useRunCode({ blogState, dispatch });
	useJumpBetweenCodeBlocks({ blogState });

	return (
		<BlogContext.Provider value={{ blogState, dispatch }}>
			{children}
		</BlogContext.Provider>
	);
}

export default BlogContextProvider;

// function hasBlogMetaChanged(
// 	prevMeta: BlogStateInterface["blogMeta"],
// 	newMeta: BlogStateInterface["blogMeta"]
// ) {
// 	return (
// 		prevMeta.id !== newMeta.id ||
// 		prevMeta.title !== newMeta.title ||
// 		prevMeta.description !== newMeta.description ||
// 		prevMeta.language !== newMeta.language
// 	);
// }
