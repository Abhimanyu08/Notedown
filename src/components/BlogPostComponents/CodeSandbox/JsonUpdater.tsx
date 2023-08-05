import { useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import React, { useContext, useEffect } from "react";
import { JsonEditorContext } from "./CodesandboxWithEditor";
import { SandpackConfigType } from "./types";
import { EditorContext } from "@/app/write/components/EditorContext";

function JsonUpdater({ persistanceKey }: { persistanceKey: string }) {
	const { sandpack } = useSandpack();
	const { jsonEditorView, sandpackProps } = useContext(JsonEditorContext);
	const { editorState } = useContext(EditorContext);

	const { activeFile, files } = sandpack;
	const { code } = useActiveCode();

	useEffect(() => {
		if (sandpackProps && jsonEditorView) {
			let propsCopy = JSON.parse(jsonEditorView.state.sliceDoc());
			// codefiles[activeFile] = code;
			// propsCopy.files = codefiles;
			propsCopy.files[activeFile] = files[activeFile].code;
			const newConfig = JSON.stringify(propsCopy, null, 2);

			jsonEditorView.dispatch({
				changes: [
					{
						from: 0,
						to: jsonEditorView.state.doc.length,
						insert: newConfig + "\n",
					},
				],
			});
		}
	}, [code]);

	return <></>;
}

export default JsonUpdater;
