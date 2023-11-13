import { useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import React, { useContext, useEffect, useState } from "react";
import { JsonEditorContext } from "./CodesandboxWithEditor";
import { SandpackConfigType } from "./types";
import { EditorContext } from "@/app/write/components/EditorContext";

function JsonUpdater({
	persistanceKey,
	template,
}: {
	persistanceKey: string;
	template: string;
}) {
	const { sandpack } = useSandpack();
	const { jsonEditorView, sandpackProps } = useContext(JsonEditorContext);
	const [currentTemplate, setCurrentTemplate] = useState(template);

	const { activeFile, files } = sandpack;
	const { code } = useActiveCode();

	useEffect(() => {
		if (sandpackProps && jsonEditorView) {
			let propsCopy = JSON.parse(jsonEditorView.state.sliceDoc());
			if (currentTemplate !== template) {
				propsCopy.files = {};
			} else {
				propsCopy.files[activeFile] = files[activeFile].code;
			}
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
			setCurrentTemplate(template);
		}
	}, [code, template]);

	return <></>;
}

export default JsonUpdater;
