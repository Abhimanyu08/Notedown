import { useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import React, { useContext, useEffect } from "react";
import { JsonEditorContext } from "./Codesandbox";
import { SandpackConfigType } from "./types";

function JsonUpdater() {
	const { sandpack } = useSandpack();
	const { jsonEditorView, sandpackProps } = useContext(JsonEditorContext);

	const { activeFile } = sandpack;
	const { code } = useActiveCode();

	useEffect(() => {
		if (sandpackProps && jsonEditorView) {
			let propsCopy = JSON.parse(
				JSON.stringify(sandpackProps)
			) as SandpackConfigType;
			let codefiles = propsCopy.files || {};
			codefiles[activeFile] = code;
			propsCopy.files = codefiles;

			jsonEditorView.dispatch({
				changes: [
					{
						from: 0,
						to: jsonEditorView.state.doc.length,
						insert: JSON.stringify(propsCopy, null, 2),
					},
				],
			});
		}
	}, [code]);

	return <></>;
}

export default JsonUpdater;
