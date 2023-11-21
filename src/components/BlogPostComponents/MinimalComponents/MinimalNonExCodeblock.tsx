import React from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

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

	await new Promise((res) => setTimeout(res, 4000));

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
			{/* <button
					className="absolute top-4 right-4 p-1 rounded-md bg-black/70 opacity-0 group-hover:opacity-100"
					onClick={() => {
						navigator.clipboard
							.writeText(code)
							.then(() => setCopied(true));
					}}
				>
					{" "}
					{copied ? (
						<BiCheck size={20} className="text-gray-100" />
					) : (
						<MdContentCopy size={20} className="text-gray-100" />
					)}
				</button> */}
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
