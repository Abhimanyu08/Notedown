"use client";
import { EditorView } from "codemirror";
import React, { Dispatch, Reducer, useReducer, createContext } from "react";

interface BlogStateInterface {
	blockToOutput: Record<string, string>;
	vimEnabled: boolean;
	blockToEditor: Record<number, EditorView>;
	runningRequest: boolean;
	runningBlock: number;
	writingBlock: number;
	author: string;
	containerId: string;
}
interface DispatchObj {
	type: "set containerId";
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
		default:
			return blogInitialState;
	}
};

const blogInitialState: BlogStateInterface = {
	blockToOutput: {},
	vimEnabled: false,
	blockToEditor: {},
	runningRequest: false,
	runningBlock: 0,
	writingBlock: 0,
	author: "",
	containerId: "",
};

export const BlogContext = createContext<{
	blogState: BlogStateInterface;
	dispatch: Dispatch<DispatchObj>;
}>({
	blogState: blogInitialState,
	dispatch: () => {},
});

function BlogContextProvider({ children }: { children: React.ReactNode }) {
	const [blogState, dispatch] = useReducer<typeof reducer>(
		reducer,
		blogInitialState
	);

	return (
		<BlogContext.Provider value={{ blogState, dispatch }}>
			{children}
		</BlogContext.Provider>
	);
}

export default BlogContextProvider;
