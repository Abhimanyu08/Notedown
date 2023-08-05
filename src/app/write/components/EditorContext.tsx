"use client";
import useEditor from "@/hooks/useEditor";
import { EditorView } from "codemirror";
import {
	Dispatch,
	Reducer,
	createContext,
	useEffect,
	useReducer,
	useState,
} from "react";

interface EditorStateInterface {
	editorView: EditorView | null;
	previousUploadedDoc: EditorView["state"]["doc"] | null;
	timeStamp: string | null;
	imagesToFiles: Record<string, File>;
	imagesToUpload: string[];
	canvasApps: Record<string, any>;
	editingMarkdown: boolean;
	frontMatterLength: number;
	sandboxEditors: Record<string, EditorView>;
	documentDb: IDBDatabase | null;
}
interface DispatchObj {
	type:
		| "set editorView"
		| "toggle markdown editor"
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
		| "set document db";

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
	sandboxEditors: {},
	documentDb: null,
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
		case "toggle markdown editor":
			return { ...state, editingMarkdown: !state.editingMarkdown };
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
	useEffect(() => {
		let documentDbRequest = indexedDB.open("RCEBLOG_DOCUMENT", 4);

		documentDbRequest.onsuccess = (e) => {
			dispatch({
				type: "set document db",
				payload: (e.target as any)?.result,
			});
		};

		documentDbRequest.onupgradeneeded = function () {
			let db = documentDbRequest.result;
			if (!db.objectStoreNames.contains("markdowns")) {
				db.createObjectStore("markdown", { keyPath: "timeStamp" });
			}
			if (!db.objectStoreNames.contains("sandpackConfigs")) {
				db.createObjectStore("sandpackConfigs", {
					keyPath: "timeStamp",
				});
			}
			if (!db.objectStoreNames.contains("images")) {
				db.createObjectStore("images", { keyPath: "imageName" });
			}
		};
	}, []);

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
