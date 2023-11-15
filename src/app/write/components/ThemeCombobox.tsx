import { Combobox } from "@components/ui/combobox";
import availableThemes from "@utils/syntaxhighlighter/availableThemes";
import React, { useContext, useEffect } from "react";
import { EditorContext } from "./EditorContext";

export function ThemeCombobox({
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
			start + frontMatterLength
		);
		if (!lineMeta) return;
		const splitLineMeta = lineMeta.text.split("&");
		// const restMeta = "&" + splitLineMeta[1] + "&" + splitLineMeta[2];
		const newThemeMeta = `theme=${value}`;
		const newMeta =
			splitLineMeta.at(0)! +
			"&" +
			newThemeMeta +
			"&" +
			splitLineMeta.at(2)!;

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
			items={availableThemes}
			type="Themes"
			{...{ value, setValue }}
		/>
	);
}

export default ThemeCombobox;
