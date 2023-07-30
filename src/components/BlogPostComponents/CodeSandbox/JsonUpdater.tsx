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
			let propsCopy = JSON.parse(jsonEditorView.state.sliceDoc());
			// codefiles[activeFile] = code;
			// propsCopy.files = codefiles;
			propsCopy.files[activeFile] = files[activeFile].code;

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
