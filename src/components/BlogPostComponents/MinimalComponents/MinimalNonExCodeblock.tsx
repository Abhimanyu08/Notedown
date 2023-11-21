import CopycodeButton from "@components/CopycodeButton";
import React from "react";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";

async function MinimalNonExCodeblock({
	code,
	language,
	theme,
	showLineNumbers,
}: {
	code: string;
	language: string;
	theme: string;
	showLineNumbers: boolean;
}) {
	// const [Highlighter, setHighlighter] = useState(SyntaxHighlighter);

	const importedLanguage = await import(
		`react-syntax-highlighter/dist/esm/languages/prism/${language}`
	);
	const importedTheme = (
		await import(`react-syntax-highlighter/dist/esm/styles/prism/${theme}`)
	).default;

	SyntaxHighlighter.registerLanguage(language, importedLanguage.default);

	return (
		<div
			className="not-prose relative group 
			overflow-x-auto
w-full
lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
		"
		>
			<CopycodeButton code={code} />
			<SyntaxHighlighter
				language={language}
				style={importedTheme}
				customStyle={{
					paddingLeft: showLineNumbers ? "8px" : "16px",
					fontSize: "16px",
					width: "fit-content",
					minWidth: "100%",
				}}
				showLineNumbers={showLineNumbers}
			>
				{code.trim()}
			</SyntaxHighlighter>
		</div>
	);
}

export default MinimalNonExCodeblock;
