"use client";
import useEditor from "@/hooks/useEditor";
import { EditorView } from "codemirror";
import { Dispatch, Reducer, createContext, useReducer } from "react";

interface EditorStateInterface {
	editorView: EditorView | null;
	previousUploadedDoc: EditorView["state"]["doc"] | null;
	timeStamp: string | null;
	imagesToFiles: Record<string, File>;
	imagesToUpload: string[];
	canvasApps: Record<string, any>;
	editingMarkdown: boolean;
	frontMatterLength: number;
	codeBlockToSyncState: Record<string, boolean>;
	syncingCodeBlock: string | null;
}
interface DispatchObj {
	type:
		| "set editorView"
		| "toggle markdown editor"
		| "set previous uploaded doc"
		| "set time stamp"
		| "set image to files"
		| "remove image from upload"
		| "add images to upload"
		| "set canvas apps"
		| "remove canvas app"
		| "empty canvas apps"
		| "set frontmatter length"
		| "set sync state"
		| "set syncing code block"
		| "remove sync state"
		| "set all syncing states to false";

	payload: EditorStateInterface[keyof EditorStateInterface] | string;
}

const initialEditorState: EditorStateInterface = {
	editorView: null,
	previousUploadedDoc: null,
	timeStamp: null,
	imagesToFiles: {},
	imagesToUpload: [],
	canvasApps: {},
	editingMarkdown: false,
	frontMatterLength: 0,
	codeBlockToSyncState: {},
	syncingCodeBlock: null,
};

export const EditorContext = createContext<{
	editorState: EditorStateInterface;
	dispatch: Dispatch<DispatchObj>;
}>({
	editorState: initialEditorState,
	dispatch: () => {},
});

const reducer: Reducer<EditorStateInterface, DispatchObj> = (state, action) => {
	switch (action.type) {
		case "set canvas apps":
			return {
				...state,
				canvasApps: {
					...state.canvasApps,
					...(action.payload as Record<string, any>),
				},
			};

		case "set sync state":
			return {
				...state,
				codeBlockToSyncState: {
					...state.codeBlockToSyncState,
					...(action.payload as EditorStateInterface["codeBlockToSyncState"]),
				},
			};
		case "set all syncing states to false":
			const newSyncingStates: EditorStateInterface["codeBlockToSyncState"] =
				{};
			for (let k of Object.keys(state.codeBlockToSyncState)) {
				newSyncingStates[k] = false;
			}
			return {
				...state,
				codeBlockToSyncState: newSyncingStates,
			};
		case "remove sync state":
			const previous = state.codeBlockToSyncState;
			delete previous[action.payload as string];
			return {
				...state,
				codeBlockToSyncState: previous,
			};

		case "set syncing code block":
			return {
				...state,
				syncingCodeBlock: action.payload as string,
			};
		case "set frontmatter length":
			return {
				...state,
				frontMatterLength: action.payload as number,
			};

		case "remove canvas app":
			const currentCanvasApps = { ...state.canvasApps };
			delete currentCanvasApps[action.payload as string];
			return {
				...state,
				canvasApps: currentCanvasApps,
			};
		case "toggle markdown editor":
			return { ...state, editingMarkdown: !state.editingMarkdown };
		case "empty canvas apps":
			return {
				...state,
				canvasApps: {},
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

		case "set editorView":
			return {
				...state,
				editorView: action.payload as EditorView | null,
			};

		case "set previous uploaded doc":
			return {
				...state,
				previousUploadedDoc: action.payload as
					| EditorView["state"]["doc"]
					| null,
			};
		case "set time stamp":
			return {
				...state,
				timeStamp: action.payload as string,
			};
	}
};

export default function EditorContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [editorState, dispatch] = useReducer<typeof reducer>(
		reducer,
		initialEditorState
	);
	const { editorView } = useEditor({
		language: "markdown",
		code: "",
		editorParentId: "markdown-textarea",
		mounted: true,
	});

	return (
		<EditorContext.Provider
			value={{
				editorState,
				dispatch,
			}}
		>
			{children}
		</EditorContext.Provider>
	);
}
