import { Combobox } from "@components/ui/combobox";
import availableLanguages from "@utils/syntaxhighlighter/availableLanguages";
import React, { useContext, useEffect } from "react";
import { EditorContext } from "./EditorContext";

export default function LanguageCombobox({ start }: { start?: number }) {
	const [value, setValue] = React.useState("javascript");

	const { editorState } = useContext(EditorContext);

	useEffect(() => {
		if (!start) return;
		const { editorView, frontMatterLength } = editorState;
		const lineMeta = editorView?.state.doc.lineAt(
			start + frontMatterLength
		);
		if (!lineMeta) return;
		const splitLineMeta = lineMeta.text.split("&");
		const restMeta = "&" + splitLineMeta[1] + "&" + splitLineMeta[2];
		const newLanguageMeta = `\`\`\`lang=${value}`;
		const newMeta = newLanguageMeta + restMeta;

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
			items={availableLanguages}
			type="Language"
			{...{ value, setValue }}
		/>
	);
}
