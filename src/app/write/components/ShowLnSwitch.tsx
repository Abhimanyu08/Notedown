import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import React, { useContext } from "react";
import { EditorContext } from "./EditorContext";

function ShowLnSwitch({
	start,
	showLineNumbers = false,
}: {
	start?: number;
	showLineNumbers?: boolean;
}) {
	const { editorState } = useContext(EditorContext);
	const onChange = () => {
		if (!start) return;
		const { editorView, frontMatterLength } = editorState;
		const lineMeta = editorView?.state.doc.lineAt(
			start + frontMatterLength
		);
		if (!lineMeta) return;
		const splitLineMeta = lineMeta.text.split("&");
		const restMeta = splitLineMeta[0] + "&" + splitLineMeta[1];
		const newSlnMeta = `&sln=${showLineNumbers ? "false" : "true"}`;
		const newMeta = restMeta + newSlnMeta;
		editorView?.dispatch({
			changes: {
				from: lineMeta?.from,
				to: lineMeta.to,
				insert: newMeta,
			},
		});
	};

	return (
		<div className="flex items-center space-x-2">
			<Switch
				id="airplane-mode"
				checked={showLineNumbers}
				onCheckedChange={onChange}
			/>
			<Label htmlFor="airplane-mode">Show line numbers</Label>
		</div>
	);
}

export default ShowLnSwitch;
