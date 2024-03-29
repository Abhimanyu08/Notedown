"use client";
import { EditorView } from "codemirror";
import { Dispatch, Reducer, createContext, useEffect, useReducer } from "react";

interface EditorStateInterface {
	editorView: EditorView | null;
	previousUploadedDoc: EditorView["state"]["doc"] | null;
	timeStamp: string | null;
	imagesToFiles: Record<string, File>;
	imagesToUpload: string[];
	canvasApps: Record<string, any>;
	frontMatterLength: number;
	sandboxEditors: Record<string, EditorView>;
	syncLocally: boolean;
}
interface DispatchObj {
	type:
		| "set editorView"
		| "set previous uploaded doc"
		| "set time stamp"
		| "add image to files"
		| "remove image from upload"
		| "add images to upload"
		| "set canvas apps"
		| "remove canvas app"
		| "empty canvas apps"
		| "set frontmatter length"
		| "set sandbox editor"
		| "remove sandbox editor"
		| "set document db"
		| "sync locally";

	payload: EditorStateInterface[keyof EditorStateInterface] | string;
}

const initialEditorState: EditorStateInterface = {
	editorView: null,
	previousUploadedDoc: null,
	timeStamp: null,
	imagesToFiles: {},
	imagesToUpload: [],
	canvasApps: {},
	frontMatterLength: 0,
	sandboxEditors: {},
	syncLocally: true,
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

		case "sync locally":
			return {
				...state,
				syncLocally: (action.payload as boolean) ?? !state.syncLocally,
			};

		case "set sandbox editor":
			return {
				...state,
				sandboxEditors: {
					...state.sandboxEditors,
					...(action.payload as EditorStateInterface["sandboxEditors"]),
				},
			};

		case "remove sandbox editor":
			const previousSandboxEditors = state.sandboxEditors;
			delete previousSandboxEditors[action.payload as string];
			return {
				...state,
				sandboxEditors: previousSandboxEditors,
			};

		case "set frontmatter length":
			if (state.frontMatterLength === action.payload) return state;
			return {
				...state,
				frontMatterLength: action.payload as number,
			};
		case "set document db":
			return {
				...state,
				documentDb: action.payload as IDBDatabase | null,
			};

		case "remove canvas app":
			const currentCanvasApps = { ...state.canvasApps };
			delete currentCanvasApps[action.payload as string];
			return {
				...state,
				canvasApps: currentCanvasApps,
			};
		case "empty canvas apps":
			return {
				...state,
				canvasApps: {},
			};
		case "add image to files":
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
