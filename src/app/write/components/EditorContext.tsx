"use client";
import useEditor from "@/hooks/useEditor";
import { EditorView } from "codemirror";
import { Dispatch, Reducer, createContext, useReducer } from "react";

interface EditorStateInterface {
	editorView: EditorView | null;
	editingMarkdown: boolean;
	enabledVimForMarkdown: boolean;
	previousUploadedDoc: EditorView["state"]["doc"] | null;
	timeStamp: string | null;
}
interface DispatchObj {
	type:
		| "toggle markdown editor"
		| "toggle vim"
		| "set editorView"
		| "set previous uploaded doc"
		| "set time stamp";

	payload: EditorStateInterface[keyof EditorStateInterface] | string;
}

const initialEditorState: EditorStateInterface = {
	editorView: null,
	editingMarkdown: true,
	enabledVimForMarkdown: false,
	previousUploadedDoc: null,
	timeStamp: null,
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
		case "toggle vim":
			return {
				...state,
				enabledVimForMarkdown: !state.enabledVimForMarkdown,
			};
		case "toggle markdown editor":
			return { ...state, editingMarkdown: !state.editingMarkdown };

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
