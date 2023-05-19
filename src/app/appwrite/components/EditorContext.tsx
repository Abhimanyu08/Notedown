"use client";
import useEditor from "@/hooks/useEditor";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import { EditorView } from "codemirror";
import { Dispatch, Reducer, createContext, useReducer } from "react";

interface EditorStateInterface {
	editorView: EditorView | null;
	editingMarkdown: boolean;
	enabledVimForMarkdown: boolean;
}
interface DispatchObj {
	type:
		| "toggle markdown editor"
		| "toggle vim"
		| "set editorView"
		| "set blog meta";
	payload: EditorStateInterface[keyof EditorStateInterface];
}

const initialEditorState: EditorStateInterface = {
	editorView: null,
	editingMarkdown: true,
	enabledVimForMarkdown: false,
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