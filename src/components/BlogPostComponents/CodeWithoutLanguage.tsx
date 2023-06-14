"use client";
import { useEffect, useState } from "react";
import { BiCheck } from "react-icons/bi";
import { MdContentCopy } from "react-icons/md";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import theme from "react-syntax-highlighter/dist/cjs/styles/hljs/an-old-hope";

function CodeWithoutLanguage({
	code,
	language,
}: {
	code: string;
	language?: string;
}) {
	const [imported, setImported] = useState(false);
	const [copied, setCopied] = useState(false);
	// const [Highlighter, setHighlighter] = useState(SyntaxHighlighter);

	useEffect(() => {
		if (copied) {
			setTimeout(() => setCopied(false), 2000);
		}
	}, [copied]);

	useEffect(() => {
		if (language) {
			language = language.toLowerCase();
			if (!Object.keys(languageToImporter).includes(language)) {
				alert(`${language} not supported`);
			}
			languageToImporter[
				language as keyof typeof languageToImporter
			]().then(() => {
				console.log(`Imported ${language}`);
				setImported(true);
			});
		}
	}, []);

	return (
		<div className="not-prose relative group ">
			<button
				className="absolute top-2 right-2 p-1 rounded-md bg-black/70 opacity-0 group-hover:opacity-100"
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
			</button>
			{imported && (
				<SyntaxHighlighter
					language={language}
					style={theme}
					customStyle={{ paddingLeft: "8px" }}
					showLineNumbers={true}
					lineNumberStyle={{
						color: "rgb(148 163 184)",
					}}
				>
					{code.trim()}
				</SyntaxHighlighter>
			)}
		</div>
	);
}

const languageToImporter = {
	sql: loadSql,
	python: loadPython,
	javascript: loadJavascript,
	rust: loadRust,
	typescript: loadTypeScript,
	css: loadCSS,
	markdown: loadMarkdown,
	go: loadGo,
	c: loadC,
	bash: loadBash,
	shell: loadShell,
};

async function loadSql() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/sql"
	);
	SyntaxHighlighter.registerLanguage("sql", lang.default);
	return SyntaxHighlighter;
}

async function loadPython() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/python"
	);
	SyntaxHighlighter.registerLanguage("python", lang.default);
	return SyntaxHighlighter;
}
async function loadRust() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/rust"
	);
	SyntaxHighlighter.registerLanguage("rust", lang.default);
	return SyntaxHighlighter;
}
async function loadJavascript() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/javascript"
	);
	SyntaxHighlighter.registerLanguage("javascript", lang.default);
	return SyntaxHighlighter;
}
async function loadTypeScript() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/typescript"
	);
	SyntaxHighlighter.registerLanguage("typescript", lang.default);
	return SyntaxHighlighter;
}
async function loadCSS() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/css"
	);
	SyntaxHighlighter.registerLanguage("css", lang.default);
	return SyntaxHighlighter;
}
async function loadC() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/c"
	);
	SyntaxHighlighter.registerLanguage("c", lang.default);
	return SyntaxHighlighter;
}
async function loadGo() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/go"
	);
	SyntaxHighlighter.registerLanguage("go", lang.default);
	return SyntaxHighlighter;
}
async function loadMarkdown() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/markdown"
	);
	SyntaxHighlighter.registerLanguage("markdown", lang.default);
	return SyntaxHighlighter;
}
async function loadBash() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/bash"
	);
	SyntaxHighlighter.registerLanguage("bash", lang.default);
	return SyntaxHighlighter;
}
async function loadShell() {
	const lang = await import(
		"react-syntax-highlighter/dist/cjs/languages/hljs/shell"
	);
	SyntaxHighlighter.registerLanguage("shell", lang.default);
	return SyntaxHighlighter;
}
export default CodeWithoutLanguage;
