import { useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import React, { useContext, useEffect } from "react";
import { JsonEditorContext } from "./CodesandboxWithEditor";
import { SandpackConfigType } from "./types";

function JsonUpdater() {
	const { sandpack } = useSandpack();
	const { jsonEditorView, sandpackProps } = useContext(JsonEditorContext);

	const { activeFile, files } = sandpack;
	const { code } = useActiveCode();

	useEffect(() => {
		if (sandpackProps && jsonEditorView) {
			let propsCopy = JSON.parse(
				JSON.stringify(sandpackProps)
			) as SandpackConfigType;
			// let codefiles = propsCopy.files || {};
			// codefiles[activeFile] = code;
			// propsCopy.files = codefiles;
			const currentFiles: Record<string, string> = {};
			for (let file of Object.keys(files)) {
				currentFiles[file] = files[file].code;
			}
			propsCopy.files = currentFiles;

			jsonEditorView.dispatch({
				changes: [
					{
						from: 0,
						to: jsonEditorView.state.doc.length,
						insert: JSON.stringify(propsCopy, null, 2) + "\n",
					},
				],
			});
		}
	}, [code]);

	return <></>;
}

export default JsonUpdater;