import { ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Compartment, StateEffect } from "@codemirror/state";
import {
	SandpackProvider,
	SandpackCodeEditor,
	SandpackPreview,
	Sandpack,
	SandpackLayout,
	SandpackConsole,
} from "@codesandbox/sandpack-react";

import React, { useContext, useEffect, useRef } from "react";
import { SandpackConfigType } from "./types";
import { CodeMirrorRef } from "@codesandbox/sandpack-react/components/CodeEditor/CodeMirror";
import { JsonEditorContext } from "./Codesandbox";
import JsonUpdater from "./JsonUpdater";

function CustomSandpack(props: SandpackConfigType) {
	const cmInstance = useRef<CodeMirrorRef | null>(null);

	return (
		<SandpackProvider {...props}>
			<div className="flex flex-col w-full">
				<SandpackCodeEditor
					{...props.options}
					style={{ height: props.options?.editorHeight || 300 }}
					ref={cmInstance}
				/>
				<JsonUpdater />
				<SandpackPreview
					className="w-full h-[500px]"
					{...props.options}
				/>
				<SandpackConsole className="w-full" />
			</div>
		</SandpackProvider>
	);
}

export default CustomSandpack;
