import { Combobox } from "@components/ui/combobox";
import React, { useContext, useEffect } from "react";
import { EditorContext } from "./EditorContext";

export function EditorThemeCombobox({
	theme,
	start,
}: {
	theme: string;
	start?: number;
}) {
	const [value, setValue] = React.useState(theme);

	const { editorState } = useContext(EditorContext);

	useEffect(() => {
		if (!start) return;
		if (!value) return;
		const { editorView, frontMatterLength } = editorState;
		const lineMeta = editorView?.state.doc.lineAt(
			start + frontMatterLength - 1
		);
		if (!lineMeta) return;
		const splitLineMeta = lineMeta.text.split("&");
		// const restMeta = "&" + splitLineMeta[1] + "&" + splitLineMeta[2];
		const newThemeMeta = `theme=${value}`;
		const newMeta = splitLineMeta.at(0)! + "&" + newThemeMeta;

		editorView?.dispatch({
			changes: {
				from: lineMeta?.from,
				to: lineMeta.to,
				insert: newMeta,
			},
		});
	}, [value]);

	return (
		<Combobox
			items={themes}
			type="Editor themes"
			{...{ value, setValue }}
		/>
	);
}

const themes = [
	"oneDark",
	"amy",
	"ayuLight",
	"barf",
	"bespin",
	"birdsOfParadise",
	"boysAndGirls",
	"clouds",
	"cobalt",
	"coolGlow",
	"dracula",
	"espresso",
	"noctisLilac",
	"rosePineDawn",
	"smoothy",
	"solarizedLight",
	"tomorrow",
];

export default EditorThemeCombobox;
